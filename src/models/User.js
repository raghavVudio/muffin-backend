import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/index.js';

const schema = new mongoose.Schema({
  orgId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name:         { type: String, required: true, trim: true, maxlength: 120 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role:         { type: String, enum: Object.values(ROLES), default: ROLES.VIEWER },
  avatarUrl:    { type: String, default: null },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

schema.index({ orgId: 1 });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};
schema.statics.hashPassword = (pw) => bcrypt.hash(pw, 12);
schema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.passwordHash);
};

export default mongoose.model('User', schema);
