import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';

export const generateAccessToken = (payload) =>
  jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY });

export const storeRefreshToken = async (userId, token) => {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  // Single active session per user — clear old tokens first
  await RefreshToken.deleteMany({ userId });
  return RefreshToken.create({ userId, token, expiresAt });
};

export const rotateRefreshToken = async (oldToken) => {
  const stored = await RefreshToken.findOne({ token: oldToken, isRevoked: false });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token. Please log in again.');
  }

  let decoded;
  try {
    decoded = jwt.verify(oldToken, env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, 'Refresh token verification failed');
  }

  const payload = { userId: decoded.userId, orgId: decoded.orgId, role: decoded.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  stored.isRevoked = true;
  await stored.save();
  await storeRefreshToken(decoded.userId, refreshToken);

  return { accessToken, refreshToken, decoded };
};

export const revokeRefreshToken = async (token) => {
  await RefreshToken.updateOne({ token }, { isRevoked: true });
};

export const cookieOptions = () => ({
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   30 * 24 * 60 * 60 * 1000,
  path:     '/',
});
