import { env } from './env.js';

export const corsOptions = {
  origin: (origin, cb) => {
    const whitelist = [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'];
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
