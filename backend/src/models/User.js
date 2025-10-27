// FILE: backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  roles: {
    type: [String],
    enum: ['basic', 'founder', 'evaluator', 'admin'],
    default: ['basic']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  roleRequests: [{
    role: {
      type: String,
      enum: ['founder', 'evaluator'],
      required: true
    },
    reason: {
      type: String,
      required: true,
      maxlength: 1000
    },
    previousWork: {
      type: String,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: String
  }],
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has role
userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// Method to add role
userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
  }
};

// Method to remove role
userSchema.methods.removeRole = function(role) {
  this.roles = this.roles.filter(r => r !== role);
};

// Method to get pending role requests
userSchema.methods.getPendingRequests = function() {
  return this.roleRequests.filter(req => req.status === 'pending');
};

module.exports = mongoose.model('User', userSchema);