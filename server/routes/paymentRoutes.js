import express from 'express';
import { createPayment, getTenantPayments, getAnalytics } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createPayment);
router.route('/tenant/:tenantId').get(protect, getTenantPayments);
router.route('/analytics').get(protect, getAnalytics);

export default router;
