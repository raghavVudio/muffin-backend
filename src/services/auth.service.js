import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from './token.service.js';

export const signupOrg = async ({ email, password }) => {
  const [userExists, orgExists] = await Promise.all([
    User.findOne({ email }),
    Organization.findOne({ email }),
  ]);
  if (userExists || orgExists) throw new ApiError(409, 'Email is already registered');

  // Derive display name from email prefix (e.g. "john.doe@..." → "John Doe")
  const emailPrefix = email.split('@')[0];
  const name = emailPrefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const orgName = `${name}'s Workspace`;

  const org  = await Organization.create({ name: orgName, email });
  const hash = await User.hashPassword(password);
  const user = await User.create({
    orgId: org._id, name, email, passwordHash: hash, role: ROLES.ORG_ADMIN,
  });

  const payload      = { userId: user._id, orgId: org._id, role: user.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await storeRefreshToken(user._id, refreshToken);

  return { user, org, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email, isActive: true }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const org = await Organization.findById(user.orgId);
  if (!org || !org.isActive) throw new ApiError(403, 'Organization is suspended');

  const payload      = { userId: user._id, orgId: user.orgId, role: user.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await storeRefreshToken(user._id, refreshToken);

  return { user, org, accessToken, refreshToken };
};
