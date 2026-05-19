import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

const handler = (msg) => (_req, _res, next) => next(new ApiError(429, msg));

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 300,
  standardHeaders: true, legacyHeaders: false,
  handler: handler('Too many requests — please slow down'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  handler: handler('Too many auth attempts — try again in 15 minutes'),
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  handler: handler('AI rate limit hit — wait a moment and retry'),
});

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 120,
  standardHeaders: true, legacyHeaders: false,
  handler: handler('Too many requests — please slow down'),
});
