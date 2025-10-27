// FILE: backend/src/models/Token.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['otp_verification', 'password_reset', 'refresh'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for faster queries
tokenSchema.index({ token: 1, type: 1 });
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate 6-digit OTP
tokenSchema.statics.generateOTP = async function(userId) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const tokenDoc = await this.create({
    userId,
    token: otp,
    type: 'otp_verification',
    expiresAt
  });

  return tokenDoc;
};

// Generate password reset token
tokenSchema.statics.generatePasswordResetToken = async function(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const tokenDoc = await this.create({
    userId,
    token,
    type: 'password_reset',
    expiresAt
  });

  return tokenDoc;
};

// Verify OTP
tokenSchema.statics.verifyOTP = async function(userId, otp) {
  const tokenDoc = await this.findOne({
    userId,
    token: otp,
    type: 'otp_verification',
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDoc) {
    // Increment failed attempts
    await this.updateMany(
      { 
        userId, 
        type: 'otp_verification',
        isUsed: false 
      },
      { $inc: { attempts: 1 } }
    );
    return null;
  }

  // Mark as used
  tokenDoc.isUsed = true;
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  return tokenDoc;
};

// Invalidate all tokens for user
tokenSchema.statics.invalidateUserTokens = async function(userId, type = null) {
  const query = { userId, isUsed: false };
  
  if (type) {
    query.type = type;
  }

  await this.updateMany(query, {
    isUsed: true,
    usedAt: new Date()
  });
};

module.exports = mongoose.model('Token', tokenSchema);