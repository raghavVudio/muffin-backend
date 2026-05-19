import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';
import { rotateRefreshToken, revokeRefreshToken, cookieOptions } from '../services/token.service.js';
import User from '../models/User.js';

export const signup = asyncHandler(async (req, res) => {
  const { user, org, accessToken, refreshToken } = await authService.signupOrg(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions());
  res.status(201).json(new ApiResponse(201, { user, org, accessToken }, 'Organization registered'));
});

export const login = asyncHandler(async (req, res) => {
  const { user, org, accessToken, refreshToken } = await authService.loginUser(req.body);
  res.cookie('refreshToken', refreshToken, cookieOptions());
  res.status(200).json(new ApiResponse(200, { user, org, accessToken }, 'Login successful'));
});

export const refresh = asyncHandler(async (req, res) => {
  const oldToken = req.cookies?.refreshToken;
  if (!oldToken) throw new ApiError(401, 'Refresh token missing');
  const { accessToken, refreshToken } = await rotateRefreshToken(oldToken);
  res.cookie('refreshToken', refreshToken, cookieOptions());
  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) await revokeRefreshToken(token);
  res.clearCookie('refreshToken', { path: '/' });
  res.status(200).json(new ApiResponse(200, null, 'Logged out'));
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, 'Profile fetched'));
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated'));
});
