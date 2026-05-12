const jwt = require('jsonwebtoken');
const User = require('../models/User');
const demoStore = require('../store/demoStore');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    next(new Error('Authorization token is missing.'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user =
      process.env.DEMO_MODE === 'true'
        ? demoStore.sanitizeUser(demoStore.findUserById(decoded.userId))
        : await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      res.status(401);
      next(new Error('User linked to this token no longer exists.'));
      return;
    }

    if (req.user.isActive === false) {
      res.status(403);
      next(new Error('Your account is inactive. Please contact the society admin.'));
      return;
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error('Invalid or expired token.'));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('You do not have permission to access this resource.');
    }

    next();
  };
}

module.exports = {
  protect,
  authorize,
};
