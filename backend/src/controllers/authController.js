const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const demoStore = require('../store/demoStore');

async function register(req, res) {
  const { name, email, password, houseNumber, block } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }

  if (process.env.DEMO_MODE === 'true') {
    const user = demoStore.createUser({
      name,
      email,
      password,
      role: 'user',
      houseNumber,
      block,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user,
    });
    return;
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
    role: 'user',
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
  const { email, identifier, password } = req.body;
  const loginIdentifier = (email || identifier || '').trim();

  if (!loginIdentifier || !password) {
    res.status(400);
    throw new Error('Email or user ID and password are required.');
  }

  const query = mongoose.Types.ObjectId.isValid(loginIdentifier)
    ? {
        $or: [{ email: loginIdentifier.toLowerCase() }, { _id: loginIdentifier }],
      }
    : { email: loginIdentifier.toLowerCase() };

  const user =
    process.env.DEMO_MODE === 'true'
      ? demoStore.findUserByLogin(loginIdentifier)
      : await User.findOne(query);

  const validPassword =
    process.env.DEMO_MODE === 'true'
      ? user?.password === password
      : user && (await user.comparePassword(password));

  if (!user || !validPassword) {
    res.status(401);
    throw new Error('Invalid email/user ID or password.');
  }

  if (user.isActive === false) {
    res.status(403);
    throw new Error('Your account is inactive. Please contact the society admin.');
  }

  const safeUser = process.env.DEMO_MODE === 'true' ? demoStore.sanitizeUser(user) : user;

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: safeUser._id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
      houseNumber: safeUser.houseNumber,
      block: safeUser.block,
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
