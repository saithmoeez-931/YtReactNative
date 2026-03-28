const User = require('../models/User');

async function getWorkers(req, res) {
  const workers = await User.find({ role: 'worker' }).select('-password').sort({ name: 1 });

  res.json({
    success: true,
    workers,
  });
}

module.exports = {
  getWorkers,
};
