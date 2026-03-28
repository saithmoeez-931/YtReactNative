const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function register(req, res) {
  const { name, email, password, role, houseNumber, block } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    houseNumber,
    block,
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      houseNumber: user.houseNumber,
      block: user.block,
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      houseNumber: user.houseNumber,
      block: user.block,
    },
  });
}

async function getProfile(req, res) {
  res.json({
    success: true,
    user: req.user,
  });
}

module.exports = {
  register,
  login,
  getProfile,
};
