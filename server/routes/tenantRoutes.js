import express from 'express';
import {
  getTenantsByRoom,
  getTenantById,
  createTenant,
  updateTenant,
  updateTenantStatus,
  getPastTenantsByRoom,
  getAllTenants
} from '../controllers/tenantController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createTenant).get(protect, getAllTenants);
router.route('/:id').get(protect, getTenantById).put(protect, updateTenant);
router.route('/:id/status').put(protect, updateTenantStatus);
router.route('/room/:roomId').get(protect, getTenantsByRoom);
router.route('/room/:roomId/past').get(protect, getPastTenantsByRoom);

export default router;
