const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const normalizeHouse = require('../utils/normalizeHouse');
const {
  isUsefulCode,
  isValidEmail,
  isValidName,
  isValidPassword,
} = require('../utils/validation');
const demoStore = require('../store/demoStore');

async function register(req, res) {
  const { name, email, password, houseNumber, block } = req.body;
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();
  const cleanHouse = normalizeHouse(block, houseNumber);

  if (!isValidName(cleanName)) {
    res.status(400);
    throw new Error('Enter a real name using letters and spaces.');
  }

  if (!isValidEmail(cleanEmail)) {
    res.status(400);
    throw new Error('Enter a valid email address.');
  }

  if (!isValidPassword(cleanPassword)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters and include letters and numbers.');
  }

  if (!isUsefulCode(cleanHouse.block) || !isUsefulCode(cleanHouse.houseNumber)) {
    res.status(400);
    throw new Error('Block and house number must contain useful letters or numbers.');
  }

  if (process.env.DEMO_MODE === 'true') {
    const user = demoStore.createUser({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'user',
      houseNumber: cleanHouse.houseNumber,
      block: cleanHouse.block,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user,
    });
    return;
  }

  const existingUser = await User.findOne({ email: cleanEmail });

  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists.');
  }

  const existingHouseResident = await User.findOne({
    role: 'user',
    block: cleanHouse.block,
    houseNumber: cleanHouse.houseNumber,
  });

  if (existingHouseResident) {
    res.status(400);
    throw new Error('A resident account already exists for this house.');
  }

  let user;

  try {
    user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'user',
      houseNumber: cleanHouse.houseNumber,
      block: cleanHouse.block,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('A resident account already exists for this house.');
    }

    throw error;
  }

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

  if (!loginIdentifier || !String(password || '').trim()) {
    res.status(400);
    throw new Error('Email or user ID and password are required.');
  }

  if (!/^[A-Za-z0-9@._-]+$/.test(loginIdentifier)) {
    res.status(400);
    throw new Error('Use a valid email address or user ID.');
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
