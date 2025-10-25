const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update current user
router.put('/me', async (req, res, next) => {
  try {
    const { fullName } = req.body;

    const user = await User.findById(req.user.id);

    if (fullName) user.fullName = fullName;

    await user.save();

    res.json({ 
      message: 'Profile updated successfully', 
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;