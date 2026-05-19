import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Page from '../models/Page.js';
import Brand from '../models/Brand.js';
import BrandKit from '../models/BrandKit.js';
import { generatePageContent } from '../services/ai.service.js';

// Background job — never awaited by the controller
const runPageGeneration = async (pageId, { keyword, category, brand, brandKit }) => {
  try {
    const generated = await generatePageContent({ keyword, category, brand, brandKit });
    await Page.findByIdAndUpdate(pageId, {
      title:           generated.title,
      slug:            generated.slug,
      excerpt:         generated.excerpt         || null,
      content:         generated.content         || '',
      sections:        generated.sections        || [],
      wordCount:       generated.word_count       || 0,
      readTimeMinutes: generated.read_time_minutes || 0,
      seoScore:        generated.seo_score        || 0,
      internalLinks:   generated.internal_links   || 0,
      metaDescription: generated.meta_description || null,
      focusKeyword:    generated.focus_keyword    || keyword,
      status:          'draft',
      generationError: null,
    });
  } catch (err) {
    console.error(`[page-gen] Failed for page ${pageId}:`, err.message);
    await Page.findByIdAndUpdate(pageId, { status: 'draft', generationError: err.message });
  }
};

export const listPages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, category, search, from, to } = req.query;
  const filter = { brandId: req.params.brandId };
  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (search)   filter.title    = { $regex: search, $options: 'i' };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to)   filter.createdAt.$lte = new Date(to);
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [pages, total] = await Promise.all([
    Page.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Page.countDocuments(filter),
  ]);
  res.status(200).json(new ApiResponse(200, { pages, total, page: Number(page), limit: Number(limit) }, 'Pages fetched'));
});

export const createPage = asyncHandler(async (req, res) => {
  const page = await Page.create({
    ...req.body,
    brandId:     req.params.brandId,
    createdBy:   req.user._id,
    publishedAt: req.body.status === 'published' ? new Date() : null,
  });
  res.status(201).json(new ApiResponse(201, { page }, 'Page created'));
});

export const getPage = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ _id: req.params.id, brandId: req.params.brandId });
  if (!page) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(200, { page }, 'Page fetched'));
});

export const updatePage = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.status === 'published') update.publishedAt = new Date();
  const page = await Page.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    update, { new: true, runValidators: true }
  );
  if (!page) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(200, { page }, 'Page updated'));
});

export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findOneAndDelete({ _id: req.params.id, brandId: req.params.brandId });
  if (!page) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(200, null, 'Page deleted'));
});

export const publishPage = asyncHandler(async (req, res) => {
  const page = await Page.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    { status: 'published', publishedAt: new Date() }, { new: true }
  );
  if (!page) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(200, { page }, 'Page published'));
});

export const unpublishPage = asyncHandler(async (req, res) => {
  const page = await Page.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    { status: 'draft', publishedAt: null }, { new: true }
  );
  if (!page) throw new ApiError(404, 'Page not found');
  res.status(200).json(new ApiResponse(200, { page }, 'Page unpublished'));
});

export const generatePageAsync = asyncHandler(async (req, res) => {
  const { keyword, category } = req.body;
  const { brandId } = req.params;

  const [brand, brandKit] = await Promise.all([
    Brand.findOne({ _id: brandId, orgId: req.user.orgId, isActive: true }),
    BrandKit.findOne({ brandId }),
  ]);
  if (!brand) throw new ApiError(404, 'Brand not found');

  // Create skeleton page immediately so frontend has an ID to poll
  const page = await Page.create({
    brandId,
    createdBy:   req.user._id,
    title:       keyword,
    category,
    keyword,
    status:      'generating',
  });

  // Fire and forget — response is sent before generation completes
  runPageGeneration(page._id, { keyword, category, brand, brandKit }).catch(() => {});

  res.status(202).json(new ApiResponse(202, { page }, 'Page generation started'));
});
