import { Router } from 'express';
import { validateCoupon, getAllCoupons } from '../controllers/coupon.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', authenticate, getAllCoupons);

export default router;
