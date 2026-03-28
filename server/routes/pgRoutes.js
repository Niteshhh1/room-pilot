import express from 'express';
import { getPGs, getPGById, createPG, updatePG, deletePG } from '../controllers/pgController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getPGs).post(protect, createPG);
router.route('/:id').get(protect, getPGById).put(protect, updatePG).delete(protect, deletePG);

export default router;
