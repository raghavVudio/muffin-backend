import mongoose from 'mongoose';
import { PLAN_TYPES, PLAN_LIMITS } from '../constants/index.js';

const schema = new mongoose.Schema({
  orgId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  domain:      { type: String, trim: true, lowercase: true, default: null },
  initials:    { type: String, maxlength: 4, trim: true },
  planType:    { type: String, enum: PLAN_TYPES, default: 'free' },
  pagesLimit:  { type: Number, default: 10 },
  videosLimit: { type: Number, default: 5 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

schema.index({ orgId: 1 });
schema.pre('save', function (next) {
  if (!this.initials && this.name) {
    this.initials = this.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 4);
  }
  if (this.isModified('planType')) {
    const limits = PLAN_LIMITS[this.planType];
    this.pagesLimit  = limits.pages;
    this.videosLimit = limits.videos;
  }
  next();
});

export default mongoose.model('Brand', schema);
