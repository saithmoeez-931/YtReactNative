const Complaint = require('../models/Complaint');
const User = require('../models/User');
const calculatePriority = require('../utils/calculatePriority');

async function createComplaint(req, res) {
  const { category, description, houseNumber, block, image } = req.body;

  if (!category || !description || !block) {
    res.status(400);
    throw new Error('Category, description, and block are required.');
  }

  const duplicateCandidates = await Complaint.find({
    category,
    block,
    status: { $ne: 'Resolved' },
  }).sort({ createdAt: -1 });

  const duplicateCount = duplicateCandidates.length;

  const complaint = await Complaint.create({
    userId: req.user._id,
    category,
    description,
    houseNumber,
    block,
    image: req.file ? `/uploads/${req.file.filename}` : image || '',
    priority: calculatePriority(category, duplicateCount),
    possibleDuplicateOf: duplicateCandidates[0]?._id || null,
  });

  const populatedComplaint = await Complaint.findById(complaint._id)
    .populate('userId', 'name email block houseNumber')
    .populate('assignedTo', 'name email');

  res.status(201).json({
    success: true,
    message:
      duplicateCount > 0
        ? 'Complaint created. Possible duplicate issues were detected in the same block.'
        : 'Complaint created successfully.',
    complaint: populatedComplaint,
  });
}

async function getComplaints(req, res) {
  const { assignedOnly } = req.query;
  const filters = {};

  if (req.user.role === 'user') {
    filters.userId = req.user._id;
  }

  if (req.user.role === 'worker' || assignedOnly === 'true') {
    filters.assignedTo = req.user._id;
  }

  const complaints = await Complaint.find(filters)
    .populate('userId', 'name email block houseNumber')
    .populate('assignedTo', 'name email')
    .populate('remarks.addedBy', 'name role')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    complaints,
  });
}

async function getComplaintById(req, res) {
  const complaint = await Complaint.findById(req.params.id)
    .populate('userId', 'name email block houseNumber')
    .populate('assignedTo', 'name email role')
    .populate('remarks.addedBy', 'name role');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found.');
  }

  if (
    req.user.role === 'user' &&
    complaint.userId._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('You can only view your own complaints.');
  }

  if (
    req.user.role === 'worker' &&
    complaint.assignedTo?._id?.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('You can only view complaints assigned to you.');
  }

  res.json({
    success: true,
    complaint,
  });
}

async function assignComplaint(req, res) {
  const workerId = req.body.workerId || req.query.workerId;
  const { remark } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found.');
  }

  if (!workerId) {
    res.status(400);
    throw new Error('Worker ID is required.');
  }

  const worker = await User.findById(workerId);

  if (!worker) {
    res.status(400);
    throw new Error('Selected worker ID was not found.');
  }

  if (worker.role !== 'worker') {
    res.status(400);
    throw new Error('Selected user exists but is not a worker.');
  }

  complaint.assignedTo = worker._id;
  complaint.status = 'In Progress';

  if (remark) {
    complaint.remarks.push({
      text: remark,
      addedBy: req.user._id,
    });
  }

  await complaint.save();

  const updatedComplaint = await Complaint.findById(complaint._id)
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email role')
    .populate('remarks.addedBy', 'name role');

  res.json({
    success: true,
    message: 'Complaint assigned successfully.',
    complaint: updatedComplaint,
  });
}

async function updateComplaintStatus(req, res) {
  const { status, remark, proofImage, rating, feedbackComment } = req.body;

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found.');
  }

  if (req.user.role === 'worker') {
    const isAssignedWorker = complaint.assignedTo?.toString() === req.user._id.toString();

    if (!isAssignedWorker) {
      res.status(403);
      throw new Error('You can only update complaints assigned to you.');
    }
  }

  if (req.user.role === 'user') {
    const isOwner = complaint.userId.toString() === req.user._id.toString();

    if (!isOwner) {
      res.status(403);
      throw new Error('You can only update your own complaints.');
    }

    if (status || remark || req.file || proofImage) {
      res.status(403);
      throw new Error('Residents can only submit feedback after resolution.');
    }

    if (complaint.status !== 'Resolved') {
      res.status(400);
      throw new Error('Feedback can only be added after the complaint is resolved.');
    }
  }

  if (status) {
    complaint.status = status;
  }

  if (remark) {
    complaint.remarks.push({
      text: remark,
      addedBy: req.user._id,
    });
  }

  if (req.file) {
    complaint.proofImage = `/uploads/${req.file.filename}`;
  } else if (proofImage) {
    complaint.proofImage = proofImage;
  }

  if (rating || feedbackComment) {
    complaint.feedback = {
      rating,
      comment: feedbackComment,
    };
  }

  await complaint.save();

  const updatedComplaint = await Complaint.findById(complaint._id)
    .populate('userId', 'name email block houseNumber')
    .populate('assignedTo', 'name email role')
    .populate('remarks.addedBy', 'name role');

  res.json({
    success: true,
    message: 'Complaint updated successfully.',
    complaint: updatedComplaint,
  });
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
};
