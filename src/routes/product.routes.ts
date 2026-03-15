import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct } from '../controllers/product.controller.js';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Product routes
router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/products', authenticate, authorize(['admin']), createProduct);

// Category routes
router.get('/categories', getCategories);
router.post('/categories', authenticate, authorize(['admin']), createCategory);

export default router;
