import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Brand from '../models/Brand.js';
import UserBrand from '../models/UserBrand.js';
import BrandKit from '../models/BrandKit.js';
import User from '../models/User.js';
import { ROLES, PLAN_LIMITS } from '../constants/index.js';
import { runBrandScan } from '../services/scan.service.js';

export const listBrands = asyncHandler(async (req, res) => {
  let brands;
  if (req.user.role === ROLES.ORG_ADMIN) {
    brands = await Brand.find({ orgId: req.user.orgId, isActive: true }).sort({ createdAt: -1 });
  } else {
    const memberships = await UserBrand.find({ userId: req.user._id }).populate({ path: 'brandId', match: { isActive: true } });
    brands = memberships.map((m) => m.brandId).filter(Boolean);
  }
  res.status(200).json(new ApiResponse(200, { brands }, 'Brands fetched'));
});

export const createBrand = asyncHandler(async (req, res) => {
  const { name, domain, planType = 'free' } = req.body;
  const brand = await Brand.create({ orgId: req.user.orgId, name, domain, planType });
  await BrandKit.create({ brandId: brand._id });
  res.status(201).json(new ApiResponse(201, { brand }, 'Brand created'));
});

export const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ _id: req.params.brandId, orgId: req.user.orgId, isActive: true });
  if (!brand) throw new ApiError(404, 'Brand not found');
  res.status(200).json(new ApiResponse(200, { brand }, 'Brand fetched'));
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOneAndUpdate(
    { _id: req.params.brandId, orgId: req.user.orgId },
    req.body, { new: true, runValidators: true }
  );
  if (!brand) throw new ApiError(404, 'Brand not found');
  res.status(200).json(new ApiResponse(200, { brand }, 'Brand updated'));
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOneAndUpdate(
    { _id: req.params.brandId, orgId: req.user.orgId }, { isActive: false }, { new: true }
  );
  if (!brand) throw new ApiError(404, 'Brand not found');
  res.status(200).json(new ApiResponse(200, null, 'Brand deactivated'));
});

export const getBrandKit = asyncHandler(async (req, res) => {
  let kit = await BrandKit.findOne({ brandId: req.params.brandId });
  if (!kit) kit = await BrandKit.create({ brandId: req.params.brandId });
  res.status(200).json(new ApiResponse(200, { kit }, 'Brand kit fetched'));
});

export const updateBrandKit = asyncHandler(async (req, res) => {
  const kit = await BrandKit.findOneAndUpdate(
    { brandId: req.params.brandId }, req.body, { new: true, upsert: true, runValidators: true }
  );
  res.status(200).json(new ApiResponse(200, { kit }, 'Brand kit updated'));
});

export const listMembers = asyncHandler(async (req, res) => {
  const members = await UserBrand.find({ brandId: req.params.brandId })
    .populate('userId', 'name email avatarUrl role');
  res.status(200).json(new ApiResponse(200, { members }, 'Members fetched'));
});

export const onboardBrand = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const brand = await Brand.findOne({ _id: req.params.brandId, orgId: req.user.orgId, isActive: true });
  if (!brand) throw new ApiError(404, 'Brand not found');

  const kit = await BrandKit.findOne({ brandId: brand._id });
  if (kit?.onboardingStatus === 'scanning') {
    return res.status(200).json(new ApiResponse(200, { onboardingStatus: 'scanning' }, 'Scan already in progress'));
  }

  // Fire-and-forget — return 202 immediately, scan runs in background
  runBrandScan(brand._id, url).catch(() => {});
  res.status(202).json(new ApiResponse(202, { onboardingStatus: 'scanning' }, 'Brand scan started — check kit status to track progress'));
});

export const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const user = await User.findOne({ email, orgId: req.user.orgId });
  if (!user) throw new ApiError(404, 'User not found in this organization');

  const exists = await UserBrand.findOne({ userId: user._id, brandId: req.params.brandId });
  if (exists) throw new ApiError(409, 'User already has access to this brand');

  const membership = await UserBrand.create({ userId: user._id, brandId: req.params.brandId, role });
  res.status(201).json(new ApiResponse(201, { membership }, 'Member added'));
});
