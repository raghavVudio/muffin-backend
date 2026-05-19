import Joi from 'joi';
import { VIDEO_STATUS } from '../constants/index.js';

export const createVideoSchema = Joi.object({
  title:           Joi.string().min(2).max(255).required(),
  videoUrl:        Joi.string().uri().allow(null, ''),
  thumbnailUrl:    Joi.string().uri().allow(null, ''),
  durationSeconds: Joi.number().integer().min(0).default(0),
  status:          Joi.string().valid(...VIDEO_STATUS).default('draft'),
});

export const updateVideoSchema = createVideoSchema.fork(['title'], (f) => f.optional());
