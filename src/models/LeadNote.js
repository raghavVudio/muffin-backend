import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  leadId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  content:   { type: String, required: true, maxlength: 2000 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

schema.index({ leadId: 1, createdAt: -1 });
export default mongoose.model('LeadNote', schema);
