import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 120 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  domain:   { type: String, trim: true, lowercase: true, default: null },
  logo:     { type: String, default: null },
  plan:     { type: String, enum: ['free', 'growth', 'pro'], default: 'free' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

schema.index({ email: 1 });
export default mongoose.model('Organization', schema);
