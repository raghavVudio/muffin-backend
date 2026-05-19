import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  PUBLIC_ORIGINS: process.env.PUBLIC_ORIGINS || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
};


