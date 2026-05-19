import mongoose from 'mongoose';
import { ACTIVITY_TYPES } from '../constants/index.js';

const schema = new mongoose.Schema({
  leadId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  type:        { type: String, enum: ACTIVITY_TYPES, required: true },
  description: { type: String, required: true, maxlength: 500 },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

schema.index({ leadId: 1, createdAt: -1 });
export default mongoose.model('LeadActivity', schema);
