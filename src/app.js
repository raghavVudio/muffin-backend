import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { corsOptions } from './config/cors.js';
import { publicCorsOptions } from './config/publicCors.js';
import { env } from './config/env.js';
import { globalLimiter, publicLimiter } from './middlewares/rateLimiter.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import v1Router from './routes/v1/index.js';
import publicBrandRoutes from './routes/public/brand.routes.js';

const app = express();

// Security headers
app.use(helmet());
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Cookie parsing (for refresh token cookie)
app.use(cookieParser());
// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}
// Global rate limit
app.use(globalLimiter);

// Health check (no auth)
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() })
);

// Versioned API (authenticated — CORS restricted to dashboard/app origins)
app.options('/api/v1/*', cors(corsOptions));
app.use('/api/v1', cors(corsOptions), v1Router);

// Public API (no auth, subdomain-facing — separate CORS + rate limit)
app.options('/api/public/*', cors(publicCorsOptions));
app.use('/api/public/brands', cors(publicCorsOptions), publicLimiter, publicBrandRoutes);

// 404 + error handling — must be last
app.use(notFound);
app.use(errorHandler);

export default app;
