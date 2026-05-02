const express = require('express');
const {
  assignComplaint,
  createComplaint,
  getComplaintById,
  getComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { authorize, protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router
  .route('/')
  .post(
    protect,
    authorize('user', 'admin', 'super_admin'),
    upload.single('image'),
    asyncHandler(createComplaint),
  )
  .get(protect, asyncHandler(getComplaints));

router.get('/:id', protect, asyncHandler(getComplaintById));
router.patch('/:id/assign', protect, authorize('admin', 'super_admin'), asyncHandler(assignComplaint));
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'super_admin', 'worker', 'user'),
  upload.single('proofImage'),
  asyncHandler(updateComplaintStatus),
);

module.exports = router;
