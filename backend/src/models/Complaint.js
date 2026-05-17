const mongoose = require('mongoose');
const { complaintCategories } = require('../constants/complaintTaxonomy');

const remarkSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    houseNumber: {
      type: String,
      trim: true,
    },
    block: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: complaintCategories,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    proofImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Low',
    },
    expectedResolutionHours: {
      type: Number,
      min: 1,
      default: null,
    },
    dueAt: {
      type: Date,
      default: null,
    },
    deadlineOverridden: {
      type: Boolean,
      default: false,
    },
    assignmentSource: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'auto',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    possibleDuplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    remarks: [remarkSchema],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

complaintSchema.index({ userId: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1, block: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
