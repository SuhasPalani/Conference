const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ error: 'User no longer exists' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: error.message || 'Token is invalid or expired' });
    }
  } catch (error) {
    next(error);
  }
};

// Check if user has required role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        error: `User role (${req.user.roles.join(', ')}) is not authorized to access this route. Required: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Check if email is verified
exports.requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      error: 'Please verify your email address to access this feature' 
    });
  }
  next();
};