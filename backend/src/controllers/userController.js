const User = require('../models/User');
const Complaint = require('../models/Complaint');
const {
  isValidEmail,
  isValidName,
  isValidPassword,
} = require('../utils/validation');
const demoStore = require('../store/demoStore');

async function getWorkers(req, res) {
  if (process.env.DEMO_MODE === 'true') {
    res.json({
      success: true,
      workers: demoStore.listWorkers(),
    });
    return;
  }

  const workers = await User.find({ role: 'worker' })
    .select('-password')
    .sort({ isActive: -1, name: 1 });

  res.json({
    success: true,
    workers,
  });
}

async function getActiveWorkers(req, res) {
  if (process.env.DEMO_MODE === 'true') {
    res.json({
      success: true,
      workers: demoStore.listWorkers().filter(worker => worker.isActive !== false),
    });
    return;
  }

  const workers = await User.find({ role: 'worker', isActive: true })
    .select('-password')
    .sort({ name: 1 });

  res.json({
    success: true,
    workers,
  });
}

async function getAdmins(req, res) {
  const admins = await User.find({ role: 'admin' })
    .select('-password')
    .sort({ name: 1 });

  res.json({
    success: true,
    admins,
  });
}

async function createAdmin(req, res) {
  const { name, email, password } = req.body;
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password.trim() : '';

  if (!isValidName(cleanName)) {
    res.status(400);
    throw new Error('Enter a real name using letters and spaces.');
  }

  if (!isValidEmail(cleanEmail)) {
    res.status(400);
    throw new Error('Enter a valid email address.');
  }

  if (!isValidPassword(cleanPassword)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters and include letters and numbers.');
  }

  const existingUser = await User.findOne({ email: cleanEmail });

  if (existingUser) {
    res.status(400);
    throw new Error('A user with this email already exists.');
  }

  const admin = await User.create({
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    role: 'admin',
    specialties: [],
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: 'Admin created successfully.',
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    },
  });
}

async function updateAdmin(req, res) {
  const { name, email, password } = req.body;
  const admin = await User.findOne({ _id: req.params.id, role: 'admin' });

  if (!admin) {
    res.status(404);
    throw new Error('Admin not found.');
  }

  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password.trim() : '';

  if (cleanName && !isValidName(cleanName)) {
    res.status(400);
    throw new Error('Enter a real name using letters and spaces.');
  }

  if (cleanEmail && !isValidEmail(cleanEmail)) {
    res.status(400);
    throw new Error('Enter a valid email address.');
  }

  if (cleanPassword && !isValidPassword(cleanPassword)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters and include letters and numbers.');
  }

  if (cleanEmail && cleanEmail !== admin.email) {
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      res.status(400);
      throw new Error('A user with this email already exists.');
    }
  }

  if (cleanName) {
    admin.name = cleanName;
  }

  if (cleanEmail) {
    admin.email = cleanEmail;
  }

  if (cleanPassword) {
    admin.password = cleanPassword;
  }

  await admin.save();

  res.json({
    success: true,
    message: 'Admin updated successfully.',
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    },
  });
}

async function createWorker(req, res) {
  const { name, email, password, houseNumber, block, specialties = [] } = req.body;
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password.trim() : '';
  const cleanSpecialties = Array.isArray(specialties)
    ? specialties
    : String(specialties || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

  if (!isValidName(cleanName)) {
    res.status(400);
    throw new Error('Enter a real name using letters and spaces.');
  }

  if (!isValidEmail(cleanEmail)) {
    res.status(400);
    throw new Error('Enter a valid email address.');
  }

  if (!isValidPassword(cleanPassword)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters and include letters and numbers.');
  }

  const existingUser = await User.findOne({ email: cleanEmail });

  if (existingUser) {
    res.status(400);
    throw new Error('A user with this email already exists.');
  }

  const worker = await User.create({
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    role: 'worker',
    houseNumber: houseNumber || '',
    block: block || '',
    specialties: cleanSpecialties.length ? cleanSpecialties : ['general'],
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: 'Worker created successfully.',
    worker: {
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      role: worker.role,
      houseNumber: worker.houseNumber,
      block: worker.block,
      specialties: worker.specialties,
      isActive: worker.isActive,
    },
  });
}

async function updateWorker(req, res) {
  const { name, email, password, isActive, specialties } = req.body;
  const worker = await User.findOne({ _id: req.params.id, role: 'worker' });

  if (!worker) {
    res.status(404);
    throw new Error('Worker not found.');
  }

  if (typeof isActive === 'boolean') {
    worker.isActive = isActive;
  }

  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password.trim() : '';

  if (cleanName && !isValidName(cleanName)) {
    res.status(400);
    throw new Error('Enter a real name using letters and spaces.');
  }

  if (cleanEmail && !isValidEmail(cleanEmail)) {
    res.status(400);
    throw new Error('Enter a valid email address.');
  }

  if (cleanPassword && !isValidPassword(cleanPassword)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters and include letters and numbers.');
  }

  if (cleanEmail && cleanEmail !== worker.email) {
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      res.status(400);
      throw new Error('A user with this email already exists.');
    }
  }

  if (cleanName) {
    worker.name = cleanName;
  }

  if (cleanEmail) {
    worker.email = cleanEmail;
  }

  if (cleanPassword) {
    worker.password = cleanPassword;
  }

  if (specialties !== undefined) {
    const cleanSpecialties = Array.isArray(specialties)
      ? specialties
      : String(specialties || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);

    worker.specialties = cleanSpecialties.length ? cleanSpecialties : ['general'];
  }

  await worker.save();

  res.json({
    success: true,
    message: 'Worker updated successfully.',
    worker: {
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      role: worker.role,
      specialties: worker.specialties,
      isActive: worker.isActive,
    },
  });
}

async function getWorkerRecord(req, res) {
  const worker = await User.findOne({ _id: req.params.id, role: 'worker' })
    .select('-password')
    .lean();

  if (!worker) {
    res.status(404);
    throw new Error('Worker not found.');
  }

  const [recordSummary] = await Complaint.aggregate([
    {
      $match: {
        assignedTo: worker._id,
      },
    },
    {
      $facet: {
        total: [{ $count: 'count' }],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const recentComplaints = await Complaint.find({ assignedTo: worker._id })
    .populate('userId', 'name email block houseNumber')
    .select('category description status priority block houseNumber createdAt updatedAt')
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(8)
    .lean();

  const statusCounts = (recordSummary?.statusCounts || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({
    success: true,
    worker,
    record: {
      totalAssigned: recordSummary?.total?.[0]?.count || 0,
      pendingCount: statusCounts.Pending || 0,
      inProgressCount: statusCounts['In Progress'] || 0,
      resolvedCount: statusCounts.Resolved || 0,
      recentComplaints,
    },
  });
}

module.exports = {
  getAdmins,
  createAdmin,
  updateAdmin,
  getWorkers,
  getActiveWorkers,
  createWorker,
  updateWorker,
  getWorkerRecord,
};
