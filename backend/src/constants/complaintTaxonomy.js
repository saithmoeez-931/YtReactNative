const complaintCategories = [
  'Electricity',
  'Water',
  'Waste',
  'Security',
  'Plumbing',
  'Cleaning',
  'Parking',
  'Maintenance',
  'Other',
];

const workerSpecialties = [
  'electricity',
  'water',
  'waste',
  'security',
  'plumbing',
  'cleaning',
  'parking',
  'maintenance',
  'general',
];

const categorySpecialtyMap = {
  Electricity: 'electricity',
  Water: 'water',
  Waste: 'waste',
  Security: 'security',
  Plumbing: 'plumbing',
  Cleaning: 'cleaning',
  Parking: 'parking',
  Maintenance: 'maintenance',
  Other: 'general',
};

const categoryPriorityWeight = {
  Electricity: 3,
  Security: 3,
  Water: 2,
  Waste: 2,
  Plumbing: 2,
  Parking: 2,
  Maintenance: 2,
  Cleaning: 1,
  Other: 1,
};

module.exports = {
  complaintCategories,
  workerSpecialties,
  categorySpecialtyMap,
  categoryPriorityWeight,
};
