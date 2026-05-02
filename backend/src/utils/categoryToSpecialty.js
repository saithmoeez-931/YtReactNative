const categoryMap = {
  Electricity: 'electricity',
  Water: 'water',
  Waste: 'waste',
  Security: 'security',
  Other: 'general',
};

function categoryToSpecialty(category) {
  return categoryMap[category] || 'general';
}

module.exports = categoryToSpecialty;
