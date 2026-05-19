import mongoose from 'mongoose';
import { env } from './env.js';

let cached = false;

export const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) return;
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    cached = true;
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB error: ${err.message}`);
    process.exit(1);
  }
};
