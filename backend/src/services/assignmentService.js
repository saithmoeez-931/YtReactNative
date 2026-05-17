const Complaint = require('../models/Complaint');
const User = require('../models/User');
const categoryToSpecialty = require('../utils/categoryToSpecialty');

const activeStatuses = ['Pending', 'In Progress'];
const maxActiveComplaintsPerWorker = 4;

function sortByWorkload(workerA, workerB) {
  if (workerA.activeComplaintCount !== workerB.activeComplaintCount) {
    return workerA.activeComplaintCount - workerB.activeComplaintCount;
  }

  const lastAssignedA = workerA.lastAssignedAt ? new Date(workerA.lastAssignedAt).getTime() : 0;
  const lastAssignedB = workerB.lastAssignedAt ? new Date(workerB.lastAssignedAt).getTime() : 0;

  if (lastAssignedA !== lastAssignedB) {
    return lastAssignedA - lastAssignedB;
  }

  return new Date(workerA.createdAt).getTime() - new Date(workerB.createdAt).getTime();
}

async function selectBalancedWorker(category) {
  const requiredSpecialty = categoryToSpecialty(category);
  const workers = await User.find({
    role: 'worker',
    isActive: true,
    specialties: requiredSpecialty,
  })
    .select('name email specialties lastAssignedAt createdAt')
    .lean();

  if (!workers.length) {
    return {
      worker: null,
      requiredSpecialty,
      activeComplaintCount: 0,
      activeComplaintCountAfterAssignment: 0,
      reason: 'No active worker is available with the required specialty.',
    };
  }

  const workerIds = workers.map(worker => worker._id);
  const workload = await Complaint.aggregate([
    {
      $match: {
        assignedTo: { $in: workerIds },
        status: { $in: activeStatuses },
      },
    },
    {
      $group: {
        _id: '$assignedTo',
        count: { $sum: 1 },
      },
    },
  ]);

  const workloadMap = new Map(
    workload.map(item => [item._id.toString(), item.count]),
  );

  const rankedWorkers = workers
    .map(worker => ({
      ...worker,
      activeComplaintCount: workloadMap.get(worker._id.toString()) || 0,
    }))
    .sort(sortByWorkload);

  const selectedWorker = rankedWorkers[0];

  if (selectedWorker.activeComplaintCount >= maxActiveComplaintsPerWorker) {
    return {
      worker: null,
      requiredSpecialty,
      activeComplaintCount: selectedWorker.activeComplaintCount,
      activeComplaintCountAfterAssignment: selectedWorker.activeComplaintCount,
      reason: `All ${requiredSpecialty} workers already have ${maxActiveComplaintsPerWorker} or more active complaint(s).`,
    };
  }

  return {
    worker: selectedWorker,
    requiredSpecialty,
    activeComplaintCount: selectedWorker.activeComplaintCount,
    activeComplaintCountAfterAssignment: selectedWorker.activeComplaintCount + 1,
    reason: `Selected by ${requiredSpecialty} specialty and lowest active workload.`,
  };
}

async function markWorkerAssigned(workerId) {
  if (!workerId) {
    return;
  }

  await User.findByIdAndUpdate(workerId, { lastAssignedAt: new Date() });
}

module.exports = {
  selectBalancedWorker,
  markWorkerAssigned,
  maxActiveComplaintsPerWorker,
};
