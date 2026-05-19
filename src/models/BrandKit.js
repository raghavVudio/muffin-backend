import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, unique: true },
  onboardingStatus: { type: String, enum: ['idle', 'scanning', 'done', 'failed'], default: 'idle' },
  colors: {
    primary:    { type: String, default: '#000000' },
    secondary:  { type: String, default: '#ffffff' },
    accent:     { type: String, default: '#0066cc' },
    background: { type: String, default: '#f5f5f5' },
    extras:     [{ name: String, hex: String }],
  },
  fonts: {
    heading: { type: String, default: 'Inter' },
    body:    { type: String, default: 'Inter' },
  },
  logos: {
    primary:   { type: String, default: null },
    secondary: { type: String, default: null },
    favicon:   { type: String, default: null },
  },
  images:        [{ url: String, type: { type: String, enum: ['logo', 'hero', 'icon', 'other'], default: 'other' } }],
  tagline:       { type: String, default: null, maxlength: 300 },
  description:   { type: String, default: null, maxlength: 2000 },
  brandVoice:    { type: String, default: null, maxlength: 1000 },
  brandKeywords: [String],
}, { timestamps: true });

export default mongoose.model('BrandKit', schema);
