const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/summary', protect, asyncHandler(getSummary));

module.exports = router;
