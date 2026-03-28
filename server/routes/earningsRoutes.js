import express from 'express';
import { getYearlyEarnings } from '../controllers/earningsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getYearlyEarnings);

export default router;
