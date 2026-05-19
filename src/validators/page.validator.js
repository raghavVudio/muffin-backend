import Joi from 'joi';
import { PAGE_CATEGORIES, PAGE_STATUS } from '../constants/index.js';

export const createPageSchema = Joi.object({
  title:           Joi.string().min(3).max(255).required(),
  slug:            Joi.string().lowercase().allow(null, ''),
  category:        Joi.string().valid(...PAGE_CATEGORIES).required(),
  keyword:         Joi.string().max(255).allow('', null),
  content:         Joi.string().allow('', null),
  status:          Joi.string().valid(...PAGE_STATUS).default('draft'),
  wordCount:       Joi.number().integer().min(0).default(0),
  readTimeMinutes: Joi.number().integer().min(0).default(0),
  seoScore:        Joi.number().integer().min(0).max(100).default(0),
  internalLinks:   Joi.number().integer().min(0).default(0),
});

export const updatePageSchema = createPageSchema.fork(['title', 'category'], (f) => f.optional());

export const generatePageSchema = Joi.object({
  keyword:  Joi.string().min(2).max(255).required(),
  category: Joi.string().valid(...PAGE_CATEGORIES).required(),
  brandId:  Joi.string().required(),
});

// Used for async generation — brandId comes from URL params, not body
export const generatePageAsyncSchema = Joi.object({
  keyword:  Joi.string().min(2).max(255).required(),
  category: Joi.string().valid(...PAGE_CATEGORIES).required(),
});
