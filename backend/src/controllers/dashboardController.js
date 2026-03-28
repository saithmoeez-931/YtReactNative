const Complaint = require('../models/Complaint');

async function getSummary(req, res) {
  const filters = {};

  if (req.user.role === 'user') {
    filters.userId = req.user._id;
  }

  if (req.user.role === 'worker') {
    filters.assignedTo = req.user._id;
  }

  const [totalComplaints, pendingCount, inProgressCount, resolvedCount, byCategory] =
    await Promise.all([
      Complaint.countDocuments(filters),
      Complaint.countDocuments({ ...filters, status: 'Pending' }),
      Complaint.countDocuments({ ...filters, status: 'In Progress' }),
      Complaint.countDocuments({ ...filters, status: 'Resolved' }),
      Complaint.aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

  res.json({
    success: true,
    summary: {
      totalComplaints,
      pendingCount,
      inProgressCount,
      resolvedCount,
      byCategory,
    },
  });
}

module.exports = {
  getSummary,
};
