import { Router } from 'express';
import { signup, login, checkPhone, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { signupSchema, loginSchema } from '../schemas/index.js';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/check-phone', checkPhone);
router.get('/profile', authenticate, getProfile);

export default router;
