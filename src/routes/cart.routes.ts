import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, bulkAddToCart, removeCartItemByProductId } from '../controllers/cart.controller.js';
import { getAddresses, createAddress, deleteAddress } from '../controllers/address.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Cart routes
router.get('/', authenticate, getCart);
router.post('/add', authenticate, addToCart);
router.put('/item/:id', authenticate, updateCartItem);
router.delete('/item/:id', authenticate, removeCartItem);
router.delete('/product/:productId', authenticate, removeCartItemByProductId);
router.post('/bulk-add', authenticate, bulkAddToCart);

// Address routes
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, createAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;
