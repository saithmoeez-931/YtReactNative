const Complaint = require('../models/Complaint');
const User = require('../models/User');
const {
  markWorkerAssigned,
  selectBalancedWorker,
} = require('../services/assignmentService');
const calculatePriority = require('../utils/calculatePriority');
const calculateResolutionTimeline = require('../utils/calculateResolutionTimeline');
const { isUsefulCode, isUsefulText } = require('../utils/validation');
const { complaintCategories } = require('../constants/complaintTaxonomy');
const demoStore = require('../store/demoStore');

async function createComplaint(req, res) {
  const { category, description, houseNumber, block } = req.body;

  const cleanCategory = String(category || '').trim();
  const cleanDescription = String(description || '').trim().replace(/\s+/g, ' ');
  const cleanBlock = String(block || '').trim().toUpperCase();
  const cleanHouseNumber = String(houseNumber || '').trim().toUpperCase();

  if (!complaintCategories.includes(cleanCategory)) {
    res.status(400);
    throw new Error('Select a valid complaint category.');
  }

  if (!isUsefulCode(cleanBlock) || !isUsefulCode(cleanHouseNumber)) {
    res.status(400);
    throw new Error('Block and house number must contain useful letters or numbers.');
  }

  if (!isUsefulText(cleanDescription, 15)) {
    res.status(400);
    throw new Error('Description must be at least 15 meaningful characters.');
  }

  if (process.env.DEMO_MODE === 'true') {
    const complaint = demoStore.createComplaint(
      req.user,
      {
        category: cleanCategory,
        description: cleanDescription,
        houseNumber: cleanHouseNumber,
        block: cleanBlock,
      },
    );

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully.',
      complaint,
    });
    return;
  }

  const duplicateCandidates = await Complaint.find({
    category: cleanCategory,
    block: cleanBlock,
    status: { $ne: 'Resolved' },
  }).sort({ createdAt: -1 });

  const duplicateCount = duplicateCandidates.length;
  const {
    worker: autoAssignedWorker,
    requiredSpecialty,
    activeComplaintCount,
    activeComplaintCountAfterAssignment,
    reason: assignmentReason,
  } = await selectBalancedWorker(cleanCategory);
  const priority = calculatePriority(cleanCategory, duplicateCount);
  const timeline = calculateResolutionTimeline({
    priority,
    activeComplaintCount: activeComplaintCountAfterAssignment,
    duplicateCount,
  });

  const complaint = await Complaint.create({
    userId: req.user._id,
    category: cleanCategory,
    description: cleanDescription,
    houseNumber: cleanHouseNumber,
    block: cleanBlock,
    priority,
    expectedResolutionHours: timeline.expectedResolutionHours,
    dueAt: timeline.dueAt,
    assignedTo: autoAssignedWorker?._id || null,
    assignmentSource: autoAssignedWorker ? 'auto' : 'manual',
    status: autoAssignedWorker ? 'In Progress' : 'Pending',
    possibleDuplicateOf: duplicateCandidates[0]?._id || null,
    remarks: [
      {
        text: autoAssignedWorker
          ? `Auto-assigned to ${autoAssignedWorker.name}. Reason: ${assignmentReason} Workload changed from ${activeComplaintCount} to ${activeComplaintCountAfterAssignment} active complaint(s). Expected resolution: ${timeline.expectedResolutionHours} hour(s).`
          : `Auto-assignment skipped. Reason: ${assignmentReason} Required specialty: ${requiredSpecialty}. Complaint is pending admin assignment. Expected resolution: ${timeline.expectedResolutionHours} hour(s).`,
        addedBy: req.user._id,
      },
    ],
  });

  if (autoAssignedWorker) {
    await markWorkerAssigned(autoAssignedWorker._id);
  }

  const populatedComplaint = await Complaint.findById(complaint._id)
    .populate('userId', 'name email block houseNumber')
    .populate('assignedTo', 'name email');

  res.status(201).json({
    success: true,
    message:
      duplicateCount > 0
        ? 'Complaint created. Possible duplicate issues were detected in the same block.'
        : autoAssignedWorker
          ? `Complaint created and auto-assigned to ${autoAssignedWorker.name}. Active workload is now ${activeComplaintCountAfterAssignment}.`
          : `Complaint created and kept pending. ${assignmentReason}`,
    complaint: populatedComplaint,
  });
}

async function getComplaints(req, res) {
  const { assignedOnly } = req.query;

  if (process.env.DEMO_MODE === 'true') {
    res.json({
      success: true,
      complaints: demoStore.getComplaintsForUser(req.user, assignedOnly),
    });
    return;
  }

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
  if (process.env.DEMO_MODE === 'true') {
    const complaint = demoStore.getComplaintById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found.');
    }

    if (req.user.role === 'user' && complaint.userId._id !== req.user._id) {
      res.status(403);
      throw new Error('You can only view your own complaints.');
    }

    if (req.user.role === 'worker' && complaint.assignedTo?._id !== req.user._id) {
      res.status(403);
      throw new Error('You can only view complaints assigned to you.');
    }

    res.json({
      success: true,
      complaint,
    });
    return;
  }

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
  const cleanRemark = String(remark || '').trim().replace(/\s+/g, ' ');

  if (cleanRemark && !isUsefulText(cleanRemark, 5)) {
    res.status(400);
    throw new Error('Remark must contain at least 5 meaningful characters.');
  }

  if (process.env.DEMO_MODE === 'true') {
    const complaint = demoStore.getComplaintById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found.');
    }

    if (!workerId) {
      res.status(400);
      throw new Error('Worker ID is required.');
    }

    const worker = demoStore.findUserById(workerId);

    if (!worker) {
      res.status(400);
      throw new Error('Selected worker ID was not found.');
    }

    if (worker.role !== 'worker') {
      res.status(400);
      throw new Error('Selected user exists but is not a worker.');
    }

    const updatedComplaint = demoStore.assignComplaint(req.params.id, workerId, req.user, cleanRemark);

    res.json({
      success: true,
      message: 'Complaint assigned successfully.',
      complaint: updatedComplaint,
    });
    return;
  }

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

  if (!worker.isActive) {
    res.status(400);
    throw new Error('Selected worker is inactive and cannot be assigned.');
  }

  complaint.assignedTo = worker._id;
  complaint.status = 'In Progress';
  complaint.assignmentSource = 'manual';

  if (cleanRemark) {
    complaint.remarks.push({
      text: cleanRemark,
      addedBy: req.user._id,
    });
  }

  await complaint.save();
  await markWorkerAssigned(worker._id);

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
  const {
    status,
    remark,
    rating,
    feedbackComment,
    priority,
    expectedResolutionHours,
  } = req.body;
  const cleanRemark = String(remark || '').trim().replace(/\s+/g, ' ');
  const cleanFeedbackComment = String(feedbackComment || '').trim().replace(/\s+/g, ' ');

  if (status && !['Pending', 'In Progress', 'Resolved'].includes(status)) {
    res.status(400);
    throw new Error('Select a valid complaint status.');
  }

  if (cleanRemark && !isUsefulText(cleanRemark, 5)) {
    res.status(400);
    throw new Error('Remark must contain at least 5 meaningful characters.');
  }

  if (cleanFeedbackComment && !isUsefulText(cleanFeedbackComment, 5)) {
    res.status(400);
    throw new Error('Feedback comment must contain at least 5 meaningful characters.');
  }

  if (rating !== undefined && rating !== '') {
    const cleanRating = Number(rating);

    if (!Number.isInteger(cleanRating) || cleanRating < 1 || cleanRating > 5) {
      res.status(400);
      throw new Error('Rating must be a number from 1 to 5.');
    }
  }

  if (process.env.DEMO_MODE === 'true') {
    const complaint = demoStore.getComplaintById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found.');
    }

    if (req.user.role === 'worker' && complaint.assignedTo?._id !== req.user._id) {
      res.status(403);
      throw new Error('You can only update complaints assigned to you.');
    }

    if (req.user.role === 'user') {
      if (complaint.userId._id !== req.user._id) {
        res.status(403);
        throw new Error('You can only update your own complaints.');
      }

      if (status || cleanRemark) {
        res.status(403);
        throw new Error('Residents can only submit feedback after resolution.');
      }

      if (complaint.status !== 'Resolved') {
        res.status(400);
        throw new Error('Feedback can only be added after the complaint is resolved.');
      }
    }

    const updatedComplaint = demoStore.updateComplaintStatus(
      req.params.id,
      { status, remark: cleanRemark, rating, feedbackComment: cleanFeedbackComment },
      req.user,
    );

    res.json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint: updatedComplaint,
    });
    return;
  }

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

    if (status || cleanRemark) {
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

  if (priority && !['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
    res.status(400);
    throw new Error('Select a valid priority.');
  }

  if (priority && ['admin', 'super_admin'].includes(req.user.role)) {
    complaint.priority = priority;

    if (!expectedResolutionHours) {
      const timeline = calculateResolutionTimeline({
        priority,
      });
      complaint.expectedResolutionHours = timeline.expectedResolutionHours;
      complaint.dueAt = timeline.dueAt;
      complaint.deadlineOverridden = false;
    }
  }

  if (expectedResolutionHours && ['admin', 'super_admin'].includes(req.user.role)) {
    const cleanHours = Number(expectedResolutionHours);

    if (!Number.isFinite(cleanHours) || cleanHours < 1) {
      res.status(400);
      throw new Error('Expected resolution hours must be a positive number.');
    }

    complaint.expectedResolutionHours = Math.ceil(cleanHours);
    complaint.dueAt = new Date(Date.now() + Math.ceil(cleanHours) * 60 * 60 * 1000);
    complaint.deadlineOverridden = true;
  }

  if (cleanRemark) {
    complaint.remarks.push({
      text: cleanRemark,
      addedBy: req.user._id,
    });
  }

  if (rating || cleanFeedbackComment) {
    complaint.feedback = {
      rating: rating ? Number(rating) : complaint.feedback?.rating,
      comment: cleanFeedbackComment,
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
