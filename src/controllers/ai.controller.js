import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Brand from '../models/Brand.js';
import BrandKit from '../models/BrandKit.js';
import { generatePageContent } from '../services/ai.service.js';

export const generatePage = asyncHandler(async (req, res) => {
  const { keyword, category, brandId } = req.body;

  const [brand, brandKit] = await Promise.all([
    Brand.findOne({ _id: brandId, orgId: req.user.orgId, isActive: true }),
    BrandKit.findOne({ brandId }),
  ]);
  if (!brand) throw new ApiError(404, 'Brand not found');

  const generated = await generatePageContent({ keyword, category, brand, brandKit });
  res.status(200).json(new ApiResponse(200, generated, 'Content generated — review before saving'));
});
