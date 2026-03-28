import express from 'express';
import { getPendingRent, payPendingRent } from '../controllers/rentController.js';

const router = express.Router();

router.get('/pending', getPendingRent);
router.post('/pay/:tenantId', payPendingRent);

export default router;
