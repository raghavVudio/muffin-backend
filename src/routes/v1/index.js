import express from 'express';
import authRoutes      from './auth.routes.js';
import brandRoutes     from './brand.routes.js';
import pageRoutes      from './page.routes.js';
import videoRoutes     from './video.routes.js';
import leadRoutes      from './lead.routes.js';
import aiRoutes        from './ai.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = express.Router();

router.use('/auth',                       authRoutes);
router.use('/brands',                     brandRoutes);
router.use('/brands/:brandId/pages',      pageRoutes);
router.use('/brands/:brandId/videos',     videoRoutes);
router.use('/brands/:brandId/leads',      leadRoutes);
router.use('/brands',                     dashboardRoutes);
router.use('/ai',                         aiRoutes);

export default router;
