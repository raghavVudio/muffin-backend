import mongoose from 'mongoose';
import { VIDEO_STATUS } from '../constants/index.js';

const schema = new mongoose.Schema({
  brandId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  title:           { type: String, required: true, trim: true, maxlength: 255 },
  status:          { type: String, enum: VIDEO_STATUS, default: 'draft' },
  videoUrl:        { type: String, default: null },
  thumbnailUrl:    { type: String, default: null },
  durationSeconds: { type: Number, default: 0 },
  views:           { type: Number, default: 0 },
  publishedAt:     { type: Date, default: null },
}, { timestamps: true });

schema.index({ brandId: 1, status: 1 });
export default mongoose.model('Video', schema);
