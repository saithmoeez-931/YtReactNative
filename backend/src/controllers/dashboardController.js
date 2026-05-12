const Complaint = require('../models/Complaint');
const demoStore = require('../store/demoStore');

async function getSummary(req, res) {
  if (process.env.DEMO_MODE === 'true') {
    res.json({
      success: true,
      summary: demoStore.getSummaryForUser(req.user),
    });
    return;
  }

  const filters = {};

  if (req.user.role === 'user') {
    filters.userId = req.user._id;
  }

  if (req.user.role === 'worker') {
    filters.assignedTo = req.user._id;
  }

  const [summary] = await Complaint.aggregate([
    { $match: filters },
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        byCategory: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const statusCounts = (summary?.statusCounts || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.json({
    success: true,
    summary: {
      totalComplaints: summary?.total?.[0]?.count || 0,
      pendingCount: statusCounts.Pending || 0,
      inProgressCount: statusCounts['In Progress'] || 0,
      resolvedCount: statusCounts.Resolved || 0,
      byCategory: summary?.byCategory || [],
    },
  });
}

module.exports = {
  getSummary,
};
