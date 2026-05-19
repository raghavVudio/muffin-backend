import Joi from 'joi';
import { PLAN_TYPES, USER_BRAND_ROLES } from '../constants/index.js';

export const createBrandSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required().label('Brand name'),
  domain:   Joi.string().allow('', null),
  planType: Joi.string().valid(...PLAN_TYPES).default('free'),
});

export const updateBrandSchema = Joi.object({
  name:     Joi.string().min(2).max(100),
  domain:   Joi.string().allow('', null),
  planType: Joi.string().valid(...PLAN_TYPES),
});

export const onboardBrandSchema = Joi.object({
  url: Joi.string().uri({ scheme: ['http', 'https'] }).required().label('Website URL'),
});

export const addMemberSchema = Joi.object({
  email: Joi.string().email().required().lowercase(),
  role:  Joi.string().valid(...USER_BRAND_ROLES).default('VIEWER'),
});
