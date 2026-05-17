const { categoryPriorityWeight } = require('../constants/complaintTaxonomy');

function calculatePriority(category, duplicateCount = 0) {
  const baseScore = categoryPriorityWeight[category] || 1;
  const totalScore = baseScore + duplicateCount;

  if (totalScore >= 5) {
    return 'Urgent';
  }

  if (totalScore >= 3) {
    return 'High';
  }

  if (totalScore >= 2) {
    return 'Medium';
  }

  return 'Low';
}

module.exports = calculatePriority;
