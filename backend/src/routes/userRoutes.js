const express = require('express');
const { getWorkers } = require('../controllers/userController');
const { authorize, protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/workers', protect, authorize('admin'), asyncHandler(getWorkers));

module.exports = router;
