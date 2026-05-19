import mongoose from 'mongoose';
import { USER_BRAND_ROLES } from '../constants/index.js';

const schema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  role:    { type: String, enum: USER_BRAND_ROLES, default: 'VIEWER' },
}, { timestamps: true });

schema.index({ userId: 1, brandId: 1 }, { unique: true });
schema.index({ brandId: 1 });
export default mongoose.model('UserBrand', schema);
