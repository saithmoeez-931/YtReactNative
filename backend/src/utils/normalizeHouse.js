function normalizeHouse(block, houseNumber) {
  return {
    block: String(block || '').trim().toUpperCase(),
    houseNumber: String(houseNumber || '').trim().toUpperCase(),
  };
}

module.exports = normalizeHouse;
