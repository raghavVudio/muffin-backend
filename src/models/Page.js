import mongoose from 'mongoose';
import { PAGE_CATEGORIES } from '../constants/index.js';

const schema = new mongoose.Schema({
  brandId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  title:           { type: String, required: true, trim: true, maxlength: 255 },
  slug:            { type: String, trim: true, lowercase: true, default: null },
  status:          { type: String, enum: ['generating', 'draft', 'published'], default: 'draft' },
  category:        { type: String, enum: PAGE_CATEGORIES, required: true },
  keyword:         { type: String, trim: true, maxlength: 255, default: null },
  excerpt:         { type: String, default: null, maxlength: 500 },
  content:         { type: String, default: '' },
  sections:        [{ heading: String, anchor: String }],
  metaDescription: { type: String, default: null, maxlength: 300 },
  focusKeyword:    { type: String, default: null },
  wordCount:       { type: Number, default: 0 },
  readTimeMinutes: { type: Number, default: 0 },
  seoScore:        { type: Number, min: 0, max: 100, default: 0 },
  internalLinks:   { type: Number, default: 0 },
  views:           { type: Number, default: 0 },
  publishedAt:     { type: Date, default: null },
  generationError: { type: String, default: null },
}, { timestamps: true });

schema.index({ brandId: 1, status: 1 });
schema.index({ brandId: 1, category: 1 });
schema.index({ brandId: 1, slug: 1 }, { unique: true, sparse: true });
export default mongoose.model('Page', schema);
