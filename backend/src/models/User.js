const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { workerSpecialties } = require('../constants/complaintTaxonomy');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'worker', 'super_admin'],
      default: 'user',
    },
    specialties: {
      type: [String],
      enum: workerSpecialties,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAssignedAt: {
      type: Date,
      default: null,
    },
    houseNumber: {
      type: String,
      trim: true,
    },
    block: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function savePassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.index(
  { role: 1, block: 1, houseNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: 'user',
      block: { $type: 'string', $gt: '' },
      houseNumber: { $type: 'string', $gt: '' },
    },
  },
);
userSchema.index({ role: 1, isActive: 1, specialties: 1, lastAssignedAt: 1 });

module.exports = mongoose.model('User', userSchema);
