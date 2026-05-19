import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export const generatePageContent = async ({ keyword, category, brand, brandKit }) => {
  if (!env.ANTHROPIC_API_KEY) throw new ApiError(503, 'AI service not configured — add ANTHROPIC_API_KEY to .env');

  const kitContext = brandKit ? `
Brand identity:
- Voice / tone: ${brandKit.brandVoice || 'professional and informative'}
- Description: ${brandKit.description || 'not specified'}
- Tagline: ${brandKit.tagline || 'not specified'}
- Primary color: ${brandKit.colors?.primary || '#000000'}
- Keywords to weave in naturally: ${brandKit.brandKeywords?.length ? brandKit.brandKeywords.join(', ') : 'none specified'}
- Heading font: ${brandKit.fonts?.heading || 'Inter'}
` : `Brand identity: use professional and informative tone`;

  const prompt = `You are an expert SEO content writer. Generate a complete, high-quality ${category} page for the keyword: "${keyword}".

Brand: ${brand.name}
${kitContext}

Instructions:
- Write in the brand's voice and naturally include the brand keywords where relevant
- Structure the HTML content with proper h1 (only once), h2, h3, p, ul, ol tags
- The content should be comprehensive and genuinely useful to the reader
- Include a compelling introduction and a clear conclusion or call-to-action

Return ONLY valid JSON (no markdown fences, no explanation) with this exact structure:
{
  "title": "compelling SEO title under 60 characters",
  "slug": "url-friendly-slug-with-hyphens",
  "excerpt": "engaging meta description under 160 characters that teases the content",
  "content": "<full HTML content with h1, h2, h3, p, ul structure>",
  "sections": [{ "heading": "section heading", "anchor": "section-anchor-id" }],
  "word_count": <integer>,
  "read_time_minutes": <integer>,
  "seo_score": <integer 0-100>,
  "internal_links": <integer — number of internal link opportunities>,
  "meta_description": "SEO meta description under 160 characters",
  "focus_keyword": "${keyword}"
}`;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 6000,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(502, `AI generation failed: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';

  try {
    // Extract the outermost JSON object — robust against markdown fences or surrounding text
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in response');
    return JSON.parse(match[0]);
  } catch {
    throw new ApiError(502, 'AI returned an unexpected format — please retry');
  }
};
