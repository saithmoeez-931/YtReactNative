const mongoose = require('mongoose');
const calculatePriority = require('../utils/calculatePriority');

const createId = () => new mongoose.Types.ObjectId().toString();

const demoUsers = [
  {
    _id: createId(),
    name: 'Demo Admin',
    email: 'admin@societyconnect.test',
    password: 'Password123',
    role: 'admin',
    houseNumber: 'A-101',
    block: 'A',
  },
  {
    _id: createId(),
    name: 'Demo Worker',
    email: 'worker@societyconnect.test',
    password: 'Password123',
    role: 'worker',
    houseNumber: 'B-201',
    block: 'B',
  },
  {
    _id: createId(),
    name: 'Demo User',
    email: 'user@societyconnect.test',
    password: 'Password123',
    role: 'user',
    houseNumber: 'C-301',
    block: 'C',
  },
];

const demoComplaints = [];

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return { ...safeUser };
}

function attachComplaintRelations(complaint) {
  if (!complaint) {
    return null;
  }

  return {
    ...complaint,
    userId: sanitizeUser(findUserById(complaint.userId)),
    assignedTo: complaint.assignedTo ? sanitizeUser(findUserById(complaint.assignedTo)) : null,
    remarks: complaint.remarks.map(remark => ({
      ...remark,
      addedBy: sanitizeUser(findUserById(remark.addedBy)),
    })),
  };
}

function findUserById(userId) {
  return demoUsers.find(user => user._id === userId) || null;
}

function findUserByLogin(identifier) {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  return (
    demoUsers.find(
      user => user.email.toLowerCase() === normalizedIdentifier || user._id === identifier,
    ) || null
  );
}

function createUser(payload) {
  const existingUser = demoUsers.find(
    user => user.email.toLowerCase() === payload.email.trim().toLowerCase(),
  );

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const user = {
    _id: createId(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    role: payload.role || 'user',
    houseNumber: payload.houseNumber || '',
    block: payload.block || '',
  };

  demoUsers.push(user);
  return sanitizeUser(user);
}

function listWorkers() {
  return demoUsers
    .filter(user => user.role === 'worker')
    .map(sanitizeUser)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function createComplaint(user, payload, filePath) {
  const openDuplicateCandidates = demoComplaints
    .filter(
      complaint =>
        complaint.category === payload.category &&
        complaint.block === payload.block &&
        complaint.status !== 'Resolved',
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const complaint = {
    _id: createId(),
    userId: user._id,
    houseNumber: payload.houseNumber || user.houseNumber || '',
    block: payload.block,
    category: payload.category,
    description: payload.description,
    image: filePath || payload.image || '',
    proofImage: '',
    status: 'Pending',
    priority: calculatePriority(payload.category, openDuplicateCandidates.length),
    assignedTo: null,
    possibleDuplicateOf: openDuplicateCandidates[0]?._id || null,
    remarks: [],
    feedback: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  demoComplaints.push(complaint);
  return attachComplaintRelations(complaint);
}

function getComplaintsForUser(user, assignedOnly) {
  let complaints = [...demoComplaints];

  if (user.role === 'user') {
    complaints = complaints.filter(complaint => complaint.userId === user._id);
  }

  if (user.role === 'worker' || assignedOnly === 'true') {
    complaints = complaints.filter(complaint => complaint.assignedTo === user._id);
  }

  return complaints
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(attachComplaintRelations);
}

function getComplaintById(complaintId) {
  const complaint = demoComplaints.find(entry => entry._id === complaintId);
  return attachComplaintRelations(complaint);
}

function assignComplaint(complaintId, workerId, adminUser, remark) {
  const complaint = demoComplaints.find(entry => entry._id === complaintId);

  if (!complaint) {
    return null;
  }

  complaint.assignedTo = workerId;
  complaint.status = 'In Progress';
  complaint.updatedAt = new Date().toISOString();

  if (remark) {
    complaint.remarks.push({
      _id: createId(),
      text: remark,
      addedBy: adminUser._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return attachComplaintRelations(complaint);
}

function updateComplaintStatus(complaintId, payload, actor, filePath) {
  const complaint = demoComplaints.find(entry => entry._id === complaintId);

  if (!complaint) {
    return null;
  }

  if (payload.status) {
    complaint.status = payload.status;
  }

  if (payload.remark) {
    complaint.remarks.push({
      _id: createId(),
      text: payload.remark,
      addedBy: actor._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (filePath) {
    complaint.proofImage = filePath;
  } else if (payload.proofImage) {
    complaint.proofImage = payload.proofImage;
  }

  if (payload.rating || payload.feedbackComment) {
    complaint.feedback = {
      rating: payload.rating,
      comment: payload.feedbackComment,
    };
  }

  complaint.updatedAt = new Date().toISOString();

  return attachComplaintRelations(complaint);
}

function getSummaryForUser(user) {
  const complaints = getComplaintsForUser(user, user.role === 'worker' ? 'true' : 'false');

  const summary = {
    totalComplaints: complaints.length,
    pendingCount: complaints.filter(complaint => complaint.status === 'Pending').length,
    inProgressCount: complaints.filter(complaint => complaint.status === 'In Progress').length,
    resolvedCount: complaints.filter(complaint => complaint.status === 'Resolved').length,
    byCategory: [],
  };

  const categoryCounts = complaints.reduce((acc, complaint) => {
    acc[complaint.category] = (acc[complaint.category] || 0) + 1;
    return acc;
  }, {});

  summary.byCategory = Object.entries(categoryCounts)
    .map(([category, count]) => ({ _id: category, count }))
    .sort((a, b) => b.count - a.count);

  return summary;
}

module.exports = {
  createComplaint,
  createUser,
  findUserById,
  findUserByLogin,
  getComplaintById,
  getComplaintsForUser,
  getSummaryForUser,
  listWorkers,
  sanitizeUser,
  assignComplaint,
  updateComplaintStatus,
};
