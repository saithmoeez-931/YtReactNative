const categoryWeight = {
  Electricity: 3,
  Security: 3,
  Water: 2,
  Waste: 2,
  Other: 1,
};

function calculatePriority(category, duplicateCount = 0) {
  const baseScore = categoryWeight[category] || 1;
  const totalScore = baseScore + duplicateCount;

  if (totalScore >= 4) {
    return 'High';
  }

  if (totalScore >= 2) {
    return 'Medium';
  }

  return 'Low';
}

module.exports = calculatePriority;
