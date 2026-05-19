import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Brand from '../models/Brand.js';
import BrandKit from '../models/BrandKit.js';
import Page from '../models/Page.js';

const BLOG_SUMMARY_FIELDS = 'title slug excerpt category keyword seoScore wordCount readTimeMinutes publishedAt sections status';
const BLOG_FULL_FIELDS = 'title slug excerpt content category keyword sections metaDescription focusKeyword seoScore wordCount readTimeMinutes views publishedAt';
const KIT_FIELDS = 'colors fonts logos tagline description brandKeywords';

async function findActiveBrand(identifier) {
  const trimmed = identifier.trim();
  const isId = mongoose.Types.ObjectId.isValid(trimmed) && trimmed.length === 24;

  if (isId) {
    const brand = await Brand.findOne({ _id: trimmed, isActive: true });
    if (!brand) throw new ApiError(404, 'Brand not found');
    return brand;
  }

  // Normalize both sides: lowercase, strip everything from first dot onward
  // so "vudio.ai" stored as name matches input "vudio"
  const normalized = trimmed.toLowerCase();
  const brand = await Brand.findOne({
    $expr: {
      $eq: [
        { $toLower: { $arrayElemAt: [{ $split: ['$name', '.'] }, 0] } },
        normalized,
      ],
    },
    isActive: true,
  });
  if (!brand) throw new ApiError(404, 'Brand not found');
  return brand;
}

export const getPublicBrandKit = asyncHandler(async (req, res) => {
  const brand = await findActiveBrand(req.params.brandName);
  const kit = await BrandKit.findOne({ brandId: brand._id }).select(KIT_FIELDS);
  res.status(200).json(new ApiResponse(200, {
    brand: { _id: brand._id, name: brand.name, domain: brand.domain },
    kit: kit ?? {},
  }, 'Brand kit fetched'));
});

export const listPublicBlogs = asyncHandler(async (req, res) => {
  const brand = await findActiveBrand(req.params.brandName);
  const filter = { brandId: brand._id, status: { $ne: 'generating' } };
  if (req.query.status) filter.status = req.query.status;
  const blogs = await Page.find(filter)
    .select(BLOG_SUMMARY_FIELDS)
    .sort({ publishedAt: -1 });
  res.status(200).json(new ApiResponse(200, { blogs }, 'Blogs fetched'));
});

export const getPublicBlog = asyncHandler(async (req, res) => {
  const brand = await findActiveBrand(req.params.brandName);
  const blog = await Page.findOne({
    brandId: brand._id,
    slug: req.params.blogSlug,
    status: { $ne: 'generating' },
  }).select(BLOG_FULL_FIELDS);
  if (!blog) throw new ApiError(404, 'Blog not found');
  res.status(200).json(new ApiResponse(200, { blog }, 'Blog fetched'));
});
