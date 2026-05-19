import express from 'express';
import { getDashboard } from '../../controllers/dashboard.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { checkBrandAccess } from '../../middlewares/authorize.js';

const router = express.Router();
router.get('/:brandId/dashboard', authenticate, checkBrandAccess, getDashboard);

export default router;
