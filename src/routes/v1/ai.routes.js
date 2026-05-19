import express from 'express';
import { generatePage } from '../../controllers/ai.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { aiLimiter } from '../../middlewares/rateLimiter.js';
import { validate } from '../../middlewares/validate.js';
import { generatePageSchema } from '../../validators/page.validator.js';

const router = express.Router();
router.use(authenticate);
router.post('/generate-page', aiLimiter, validate(generatePageSchema), generatePage);

export default router;
