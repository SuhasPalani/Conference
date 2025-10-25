const User = require('../models/User');
const { validateEmail, validatePassword } = require('../utils/validation');

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
exports.updateMe = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields only
    if (fullName !== undefined) {
      if (!fullName || fullName.trim().length === 0) {
        return res.status(400).json({ error: 'Full name cannot be empty' });
      }
      user.fullName = fullName.trim();
    }

    // If updating email, check if it's already taken
    if (email !== undefined) {
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        user.email = email;
        user.isVerified = false; // Require re-verification
      }
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: passwordValidation.errors.join(', ') 
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        error: 'New password must be different from current password' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete account (soft delete - deactivate)
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if user is the last admin
    if (user.roles.includes('admin')) {
      const adminCount = await User.countDocuments({ roles: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          error: 'Cannot delete account. You are the last admin.' 
        });
      }
    }

    // Instead of deleting, we could deactivate
    // For now, we'll delete but you might want to implement soft delete
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user statistics (for profile)
exports.getMyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = {};

    // If founder, get idea stats
    if (req.user.roles.includes('founder')) {
      const Idea = require('../models/Idea');
      stats.ideas = {
        total: await Idea.countDocuments({ founderId: userId }),
        draft: await Idea.countDocuments({ founderId: userId, status: 'draft' }),
        submitted: await Idea.countDocuments({ founderId: userId, status: 'submitted' }),
        approved: await Idea.countDocuments({ founderId: userId, status: 'approved' }),
        rejected: await Idea.countDocuments({ founderId: userId, status: 'rejected' })
      };
    }

    // If evaluator, get evaluation stats
    if (req.user.roles.includes('evaluator')) {
      const Evaluation = require('../models/Evaluation');
      stats.evaluations = {
        total: await Evaluation.countDocuments({ evaluatorId: userId }),
        pending: await Evaluation.countDocuments({ evaluatorId: userId, status: 'pending' }),
        completed: await Evaluation.countDocuments({ evaluatorId: userId, status: 'completed' })
      };
    }

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;