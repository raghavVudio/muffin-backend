import { env } from '../config/env.js';
import BrandKit from '../models/BrandKit.js';
import Brand from '../models/Brand.js';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const FETCH_TIMEOUT_MS = 15_000;

// Lightweight regex extraction — gives Claude a clean pre-parsed summary
const extractMetaTags = (html) => {
  const get = (pattern) => (html.match(pattern) || [])[1]?.trim() || null;
  return {
    title:       get(/<title[^>]*>([^<]{1,200})<\/title>/i),
    description: get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,400})["']/i)
                 || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+name=["']description["']/i),
    ogTitle:     get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i)
                 || get(/<meta[^>]+content=["']([^"']{1,200})["'][^>]+property=["']og:title["']/i),
    ogDesc:      get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,400})["']/i)
                 || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+property=["']og:description["']/i),
    ogImage:     get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                 || get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i),
    themeColor:  get(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i)
                 || get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']theme-color["']/i),
    favicon:     get(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
                 || get(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i),
    googleFonts: (html.match(/fonts\.googleapis\.com\/css2?\?family=([^"'&\s]+)/g) || []).join(', '),
  };
};

const callClaude = async (prompt) => {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';
  const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(clean);
};

// Main background job — called fire-and-forget (never awaited by controller)
export const runBrandScan = async (brandId, url) => {
  try {
    await BrandKit.findOneAndUpdate({ brandId }, { onboardingStatus: 'scanning' }, { upsert: true });

    // Fetch website HTML with timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let html = '';
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MurphyBot/1.0; +https://murphy.ai)' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      html = await response.text();
    } finally {
      clearTimeout(timer);
    }

    const meta = extractMetaTags(html);

    // Resolve relative favicon URL to absolute
    if (meta.favicon && !meta.favicon.startsWith('http')) {
      const base = new URL(url);
      meta.favicon = new URL(meta.favicon, base.origin).href;
    }

    // Resolve relative og:image to absolute
    if (meta.ogImage && !meta.ogImage.startsWith('http')) {
      const base = new URL(url);
      meta.ogImage = new URL(meta.ogImage, base.origin).href;
    }

    // Strip script/style/svg blocks then send first 18k chars to Claude
    const cleanedHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .slice(0, 18_000);

    if (!env.ANTHROPIC_API_KEY) {
      // No AI key — save whatever meta tags gave us
      await BrandKit.findOneAndUpdate({ brandId }, {
        onboardingStatus:  'done',
        description:       meta.ogDesc || meta.description,
        ...(meta.themeColor && { 'colors.primary': meta.themeColor }),
        ...(meta.ogImage   && { 'logos.primary':   meta.ogImage   }),
        ...(meta.favicon   && { 'logos.favicon':   meta.favicon   }),
      });
      await Brand.findByIdAndUpdate(brandId, { domain: url });
      return;
    }

    const prompt = `You are a brand analyst. Analyze this website content from ${url} and extract brand identity.

Pre-extracted metadata:
- Page title: ${meta.ogTitle || meta.title || 'unknown'}
- Description: ${meta.ogDesc || meta.description || 'unknown'}
- Theme color: ${meta.themeColor || 'not found'}
- Google Fonts: ${meta.googleFonts || 'not found'}
- OG Image: ${meta.ogImage || 'not found'}
- Favicon: ${meta.favicon || 'not found'}

Raw HTML (first 18k chars):
${cleanedHtml}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "colors": {
    "primary": "#hex — dominant brand color",
    "secondary": "#hex — secondary color",
    "accent": "#hex — CTA/highlight color",
    "background": "#hex — page background",
    "extras": [{ "name": "color role", "hex": "#hex" }]
  },
  "fonts": {
    "heading": "Font family name for headings",
    "body": "Font family name for body text"
  },
  "logos": {
    "primary": "absolute URL to main logo image or null",
    "secondary": "absolute URL to secondary logo or null",
    "favicon": "absolute URL to favicon or null"
  },
  "images": [
    { "url": "absolute image URL", "type": "logo|hero|icon|other" }
  ],
  "tagline": "brand tagline or slogan if found, else null",
  "description": "1-2 sentence summary of what this brand/company does",
  "brandVoice": "describe the brand's communication tone (e.g. professional, playful, authoritative)",
  "brandKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Rules:
- Use the theme-color meta tag as primary color if found
- Use Google Fonts names if found
- Make all image URLs absolute (prefix with ${new URL(url).origin} if relative)
- brandKeywords should reflect what the brand sells/does
- If a value cannot be determined, use null for strings or [] for arrays`;

    const kit = await callClaude(prompt);

    await BrandKit.findOneAndUpdate({ brandId }, {
      onboardingStatus: 'done',
      colors:           kit.colors      || {},
      fonts:            kit.fonts       || {},
      logos:            kit.logos       || {},
      images:           kit.images      || [],
      tagline:          kit.tagline     || null,
      description:      kit.description || null,
      brandVoice:       kit.brandVoice  || null,
      brandKeywords:    kit.brandKeywords || [],
    }, { upsert: true });

    await Brand.findByIdAndUpdate(brandId, { domain: url });

  } catch (err) {
    console.error(`[scan] Brand ${brandId} scan failed:`, err.message);
    await BrandKit.findOneAndUpdate({ brandId }, { onboardingStatus: 'failed' }).catch(() => {});
  }
};
