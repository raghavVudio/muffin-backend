import UserBrand from '../models/UserBrand.js';
import { ROLES } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Role guard — pass one or more allowed roles
export const authorize = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) throw new ApiError(403, 'Insufficient permissions');
    next();
  });

// Brand-scoped access — verifies user can access :brandId
export const checkBrandAccess = asyncHandler(async (req, _res, next) => {
  const { brandId } = req.params;
  if (!brandId) return next();

  // ORG_ADMIN sees all brands in their org — no junction entry needed
  if (req.user.role === ROLES.ORG_ADMIN) return next();

  const membership = await UserBrand.findOne({ userId: req.user._id, brandId });
  if (!membership) throw new ApiError(403, 'You do not have access to this brand');

  req.brandRole = membership.role;
  next();
});
