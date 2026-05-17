const { categorySpecialtyMap } = require('../constants/complaintTaxonomy');

function categoryToSpecialty(category) {
  return categorySpecialtyMap[category] || 'general';
}

module.exports = categoryToSpecialty;
