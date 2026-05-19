import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new ApiError(401, 'Access token missing');

  const token = auth.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token');
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw new ApiError(401, 'User not found or deactivated');

  req.user = { ...user.toObject(), orgId: decoded.orgId, role: decoded.role };
  next();
});
