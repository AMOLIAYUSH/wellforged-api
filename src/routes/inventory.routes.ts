import { Router } from 'express';
import { getBatchReport, getInventoryLogs, createBatchReport } from '../controllers/inventory.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes (with optional auth tracking)
router.get('/batch-report', optionalAuthenticate, getBatchReport);

// Protected routes (Admin only for creation/logs)
router.get('/logs/:product_id', authenticate, authorize(['admin']), getInventoryLogs);
router.post('/batch-report', authenticate, authorize(['admin']), createBatchReport);

export default router;
