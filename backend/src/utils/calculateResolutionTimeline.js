const baseHoursByPriority = {
  Urgent: 4,
  High: 12,
  Medium: 24,
  Low: 48,
};

function calculateResolutionTimeline({
  priority,
  activeComplaintCount = 0,
  duplicateCount = 0,
  now = new Date(),
}) {
  const baseHours = baseHoursByPriority[priority] || baseHoursByPriority.Low;
  const workloadHours =
    activeComplaintCount >= 5 ? 18 : activeComplaintCount >= 3 ? 2 : 0;
  const duplicateMultiplier = duplicateCount > 0 ? 0.8 : 1;
  const expectedResolutionHours = Math.max(
    2,
    Math.ceil((baseHours + workloadHours) * duplicateMultiplier),
  );

  return {
    expectedResolutionHours,
    dueAt: new Date(now.getTime() + expectedResolutionHours * 60 * 60 * 1000),
  };
}

module.exports = calculateResolutionTimeline;
