import mongoose from 'mongoose';
import { LEAD_STATUS, LEAD_INTENT, LEAD_SOURCE } from '../constants/index.js';

const schema = new mongoose.Schema({
  brandId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  name:          { type: String, required: true, trim: true, maxlength: 120 },
  email:         { type: String, required: true, lowercase: true, trim: true },
  phone:         { type: String, trim: true, default: null },
  company:       { type: String, trim: true, default: null },
  status:        { type: String, enum: LEAD_STATUS, default: 'new' },
  intent:        { type: String, enum: LEAD_INTENT, default: 'cold' },
  sourceType:    { type: String, enum: LEAD_SOURCE, default: 'direct' },
  sourcePageId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Page',  default: null },
  sourceVideoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null },
  joinedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

schema.index({ brandId: 1, status: 1 });
schema.index({ brandId: 1, intent: 1 });
schema.index({ brandId: 1, email: 1 });
export default mongoose.model('Lead', schema);
