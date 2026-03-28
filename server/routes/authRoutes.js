import express from 'express';
import { authAdmin, registerAdmin, getAdminProfile, updateAdminProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', authAdmin);
router.route('/profile').get(protect, getAdminProfile).put(protect, updateAdminProfile);

export default router;
