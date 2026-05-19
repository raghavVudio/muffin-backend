import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Brand from '../models/Brand.js';
import Page from '../models/Page.js';
import Video from '../models/Video.js';
import Lead from '../models/Lead.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const { brandId } = req.params;
  const brand = await Brand.findOne({ _id: brandId, isActive: true });
  if (!brand) throw new ApiError(404, 'Brand not found');

  const [publishedPages, publishedVideos, totalLeads, hotLeads, newLeads] = await Promise.all([
    Page.countDocuments({ brandId, status: 'published' }),
    Video.countDocuments({ brandId, status: 'published' }),
    Lead.countDocuments({ brandId }),
    Lead.countDocuments({ brandId, intent: 'hot' }),
    Lead.countDocuments({ brandId, status: 'new' }),
  ]);

  res.status(200).json(new ApiResponse(200, {
    publishedPages, publishedVideos, totalLeads, hotLeads, newLeads,
    plan: { type: brand.planType, pagesLimit: brand.pagesLimit, videosLimit: brand.videosLimit },
  }, 'Dashboard data fetched'));
});
