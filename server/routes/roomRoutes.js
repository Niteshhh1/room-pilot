import express from 'express';
import { getAllRooms, getEmptyRooms, getRoomsByPG, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getAllRooms).post(protect, createRoom);
router.route('/empty').get(protect, getEmptyRooms);
router.route('/pg/:pgId').get(protect, getRoomsByPG);
router.route('/:id').get(protect, getRoomById).put(protect, updateRoom).delete(protect, deleteRoom);

export default router;
