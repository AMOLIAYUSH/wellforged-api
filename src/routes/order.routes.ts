import { Router } from 'express';
import { createOrder, getOrders, getOrderDetails, updateOrderStatus, getAllOrdersForAdmin } from '../controllers/order.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createOrderSchema } from '../schemas/index.js';

const router = Router();

// Order routes
router.post('/', optionalAuthenticate, validate(createOrderSchema), createOrder);
router.get('/', authenticate, getOrders);
router.get('/admin/all', authenticate, authorize(['admin']), getAllOrdersForAdmin);
router.get('/:id', authenticate, getOrderDetails);
router.patch('/:id/status', authenticate, authorize(['admin']), updateOrderStatus);

export default router;
