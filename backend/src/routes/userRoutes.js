const express = require('express');
const {
  createAdmin,
  createWorker,
  getAdmins,
  getWorkers,
  updateAdmin,
  updateWorker,
} = require('../controllers/userController');
const { authorize, protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/workers', protect, authorize('admin', 'super_admin'), asyncHandler(getWorkers));
router.post('/workers', protect, authorize('super_admin'), asyncHandler(createWorker));
router.patch('/workers/:id', protect, authorize('super_admin'), asyncHandler(updateWorker));
router.get('/admins', protect, authorize('super_admin'), asyncHandler(getAdmins));
router.post('/admins', protect, authorize('super_admin'), asyncHandler(createAdmin));
router.patch('/admins/:id', protect, authorize('super_admin'), asyncHandler(updateAdmin));

module.exports = router;
