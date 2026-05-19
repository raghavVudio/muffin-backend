import { env } from './env.js';

const devOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4321'];

const configuredOrigins = env.PUBLIC_ORIGINS
  ? env.PUBLIC_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const whitelist = [...new Set([...devOrigins, ...configuredOrigins])];

export const publicCorsOptions = {
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) and whitelisted browser origins
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
