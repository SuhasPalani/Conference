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
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['verification', 'password_reset', 'refresh'],
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
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
tokenSchema.index({ token: 1, type: 1 });
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens

// Static method: Generate verification token
tokenSchema.statics.generateVerificationToken = async function(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const tokenDoc = await this.create({
    userId,
    token,
    type: 'verification',
    expiresAt
  });

  return tokenDoc;
};

// Static method: Generate password reset token
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

// Static method: Generate refresh token
tokenSchema.statics.generateRefreshToken = async function(userId, ipAddress, userAgent) {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days

  const tokenDoc = await this.create({
    userId,
    token,
    type: 'refresh',
    expiresAt,
    ipAddress,
    userAgent
  });

  return tokenDoc;
};

// Static method: Verify and use token
tokenSchema.statics.verifyAndUseToken = async function(token, type) {
  const tokenDoc = await this.findOne({
    token,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!tokenDoc) {
    return null;
  }

  // Mark as used
  tokenDoc.isUsed = true;
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  return tokenDoc;
};

// Static method: Invalidate all tokens for user
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

// Instance method: Check if token is valid
tokenSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

// Instance method: Check if token is expired
tokenSchema.methods.isExpired = function() {
  return this.expiresAt <= new Date();
};

// Instance method: Mark as used
tokenSchema.methods.markAsUsed = async function() {
  this.isUsed = true;
  this.usedAt = new Date();
  await this.save();
};

// Instance method: Get time until expiration
tokenSchema.methods.getTimeUntilExpiration = function() {
  if (this.isExpired()) {
    return 0;
  }
  return this.expiresAt - new Date();
};

// Static method: Clean up expired and used tokens (for maintenance)
tokenSchema.statics.cleanup = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { 
        isUsed: true, 
        usedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Used more than 30 days ago
      }
    ]
  });

  console.log(`Cleaned up ${result.deletedCount} expired/used tokens`);
  return result.deletedCount;
};

// Static method: Get token statistics
tokenSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isUsed', false] },
                  { $gt: ['$expiresAt', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        expired: {
          $sum: {
            $cond: [
              { $lte: ['$expiresAt', new Date()] },
              1,
              0
            ]
          }
        },
        used: {
          $sum: {
            $cond: [
              { $eq: ['$isUsed', true] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return stats;
};

module.exports = mongoose.model('Token', tokenSchema);