import express from 'express';
import { signup, login, refresh, logout, getMe, updateMe } from '../../controllers/auth.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';
import { signupSchema, loginSchema, updateProfileSchema } from '../../validators/auth.validator.js';

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login',  authLimiter, validate(loginSchema),  login);
router.post('/refresh', refresh);
router.post('/logout',  logout);

router.use(authenticate);
router.get('/me',  getMe);
router.put('/me',  validate(updateProfileSchema), updateMe);

export default router;
