import Joi from 'joi';
import { LEAD_STATUS, LEAD_INTENT, LEAD_SOURCE } from '../constants/index.js';

export const createLeadSchema = Joi.object({
  name:          Joi.string().min(2).max(120).required(),
  email:         Joi.string().email().required().lowercase(),
  phone:         Joi.string().max(40).allow(null, ''),
  company:       Joi.string().max(120).allow(null, ''),
  status:        Joi.string().valid(...LEAD_STATUS).default('new'),
  intent:        Joi.string().valid(...LEAD_INTENT).default('cold'),
  sourceType:    Joi.string().valid(...LEAD_SOURCE).default('direct'),
  sourcePageId:  Joi.string().allow(null, ''),
  sourceVideoId: Joi.string().allow(null, ''),
});

export const updateLeadSchema = Joi.object({
  status:  Joi.string().valid(...LEAD_STATUS),
  intent:  Joi.string().valid(...LEAD_INTENT),
  phone:   Joi.string().max(40).allow(null, ''),
  company: Joi.string().max(120).allow(null, ''),
});

export const patchStatusSchema = Joi.object({
  status: Joi.string().valid(...LEAD_STATUS).required(),
});

export const addNoteSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});
