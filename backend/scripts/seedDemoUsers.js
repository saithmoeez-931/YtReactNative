require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');
const calculatePriority = require('../src/utils/calculatePriority');

const demoUsers = [
  {
    name: 'System Owner',
    email: 'owner@societyconnect.com',
    password: 'Owner123',
    role: 'super_admin',
    specialties: [],
    houseNumber: 'Office',
    block: 'Admin',
  },
  {
    name: 'Sara Admin',
    email: 'sara.admin@societyconnect.com',
    password: 'Admin123',
    role: 'admin',
    specialties: [],
    houseNumber: 'A-001',
    block: 'A',
  },
  {
    name: 'Ali Worker',
    email: 'ali.worker@societyconnect.com',
    password: 'Worker123',
    role: 'worker',
    specialties: ['electricity', 'security'],
    houseNumber: 'B-201',
    block: 'B',
  },
  {
    name: 'Mina Worker',
    email: 'mina.worker@societyconnect.com',
    password: 'Worker123',
    role: 'worker',
    specialties: ['water', 'waste', 'general'],
    houseNumber: 'B-202',
    block: 'B',
  },
  {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@societyconnect.com',
    password: 'Resident123',
    role: 'user',
    specialties: [],
    houseNumber: 'C-301',
    block: 'C',
  },
  {
    name: 'Ayesha Noor',
    email: 'ayesha.noor@societyconnect.com',
    password: 'Resident123',
    role: 'user',
    specialties: [],
    houseNumber: 'A-204',
    block: 'A',
  },
  {
    name: 'Bilal Sheikh',
    email: 'bilal.sheikh@societyconnect.com',
    password: 'Resident123',
    role: 'user',
    specialties: [],
    houseNumber: 'D-110',
    block: 'D',
  },
];

const demoComplaints = [
  {
    email: 'ahmed.khan@societyconnect.com',
    category: 'Water',
    description: 'There is no water supply in the kitchen since morning.',
    block: 'C',
    houseNumber: 'C-301',
    status: 'Pending',
    assignedWorkerEmail: null,
    remarks: [],
  },
  {
    email: 'ayesha.noor@societyconnect.com',
    category: 'Electricity',
    description: 'The corridor lights on the second floor are flickering.',
    block: 'A',
    houseNumber: 'A-204',
    status: 'In Progress',
    assignedWorkerEmail: 'ali.worker@societyconnect.com',
    remarks: [
      { by: 'sara.admin@societyconnect.com', text: 'Assigned to Ali for inspection.' },
      { by: 'ali.worker@societyconnect.com', text: 'Checked the panel and ordering replacement parts.' },
    ],
  },
  {
    email: 'bilal.sheikh@societyconnect.com',
    category: 'Waste',
    description: 'Garbage has not been collected from the back gate area.',
    block: 'D',
    houseNumber: 'D-110',
    status: 'Resolved',
    assignedWorkerEmail: 'mina.worker@societyconnect.com',
    remarks: [
      { by: 'sara.admin@societyconnect.com', text: 'Assigned to Mina for same-day cleanup.' },
      { by: 'mina.worker@societyconnect.com', text: 'Waste removed and area sanitized.' },
    ],
    feedback: {
      rating: 5,
      comment: 'Issue was resolved quickly.',
    },
  },
  {
    email: 'ahmed.khan@societyconnect.com',
    category: 'Security',
    description: 'The main gate camera is not recording properly.',
    block: 'C',
    houseNumber: 'C-301',
    status: 'In Progress',
    assignedWorkerEmail: 'ali.worker@societyconnect.com',
    remarks: [
      { by: 'sara.admin@societyconnect.com', text: 'High priority due to security impact.' },
    ],
  },
  {
    email: 'ayesha.noor@societyconnect.com',
    category: 'Other',
    description: 'The children park swing seat is broken.',
    block: 'A',
    houseNumber: 'A-204',
    status: 'Pending',
    assignedWorkerEmail: null,
    remarks: [],
  },
];

async function seedDemoUsers() {
  await connectDatabase();

  const userMap = new Map();

  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ email: demoUser.email });

    if (existingUser) {
      existingUser.name = demoUser.name;
      existingUser.password = demoUser.password;
      existingUser.role = demoUser.role;
      existingUser.specialties = demoUser.specialties || [];
      existingUser.isActive = true;
      existingUser.houseNumber = demoUser.houseNumber;
      existingUser.block = demoUser.block;
      await existingUser.save();
      userMap.set(existingUser.email, existingUser);
      continue;
    }

    const createdUser = await User.create(demoUser);
    userMap.set(createdUser.email, createdUser);
  }

  const adminUser = userMap.get('sara.admin@societyconnect.com');

  for (const complaintSeed of demoComplaints) {
    const resident = userMap.get(complaintSeed.email);
    const assignedWorker = complaintSeed.assignedWorkerEmail
      ? userMap.get(complaintSeed.assignedWorkerEmail)
      : null;
    const existingComplaint = await Complaint.findOne({
      userId: resident._id,
      description: complaintSeed.description,
    });

    if (existingComplaint) {
      existingComplaint.category = complaintSeed.category;
      existingComplaint.block = complaintSeed.block;
      existingComplaint.houseNumber = complaintSeed.houseNumber;
      existingComplaint.status = complaintSeed.status;
      existingComplaint.assignedTo = assignedWorker?._id || null;
      existingComplaint.assignmentSource = assignedWorker ? 'manual' : 'auto';
      existingComplaint.priority = calculatePriority(complaintSeed.category);
      existingComplaint.feedback = complaintSeed.feedback || undefined;
      existingComplaint.remarks = complaintSeed.remarks.map(item => ({
        text: item.text,
        addedBy:
          userMap.get(item.by)?._id || adminUser._id,
      }));
      await existingComplaint.save();
      continue;
    }

    await Complaint.create({
      userId: resident._id,
      category: complaintSeed.category,
      description: complaintSeed.description,
      houseNumber: complaintSeed.houseNumber,
      block: complaintSeed.block,
      status: complaintSeed.status,
      assignedTo: assignedWorker?._id || null,
      assignmentSource: assignedWorker ? 'manual' : 'auto',
      priority: calculatePriority(complaintSeed.category),
      remarks: complaintSeed.remarks.map(item => ({
        text: item.text,
        addedBy: userMap.get(item.by)?._id || adminUser._id,
      })),
      feedback: complaintSeed.feedback || undefined,
    });
  }

  const users = await User.find(
    { email: { $in: demoUsers.map(user => user.email) } },
    'name email role specialties houseNumber block',
  )
    .sort({ role: 1, email: 1 })
    .lean();

  const complaintCount = await Complaint.countDocuments({
    description: { $in: demoComplaints.map(item => item.description) },
  });

  console.log('Demo users are ready:');
  users.forEach(user => {
    console.log(`- ${user.role}: ${user.name} | ${user.email} | ${user.houseNumber} | ${user.specialties?.join(', ') || 'none'}`);
  });
  console.log('');
  console.log('Passwords:');
  console.log('- Super Admin: Owner123');
  console.log('- Admin: Admin123');
  console.log('- Workers: Worker123');
  console.log('- Residents: Resident123');
  console.log('');
  console.log(`Demo complaints ready: ${complaintCount}`);
}

seedDemoUsers()
  .catch(error => {
    console.error('Failed to seed demo users:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
