const jwt = require('jsonwebtoken');

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  accessTokenExpire: process.env.JWT_EXPIRE || '24h',
  refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '180d',
  algorithm: 'HS256'
};

// Validate JWT configuration
const validateJWTConfig = () => {
  if (!jwtConfig.secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  if (jwtConfig.secret.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters for security');
  }

  console.log('✅ JWT configuration validated');
};

// Generate access token
const generateAccessToken = (userId, expiresIn = jwtConfig.accessTokenExpire) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    jwtConfig.secret,
    { 
      expiresIn,
      algorithm: jwtConfig.algorithm
    }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    jwtConfig.secret,
    { 
      expiresIn: jwtConfig.refreshTokenExpire,
      algorithm: jwtConfig.algorithm
    }
  );
};

// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Get token expiration time
const getTokenExpiration = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return new Date(decoded.exp * 1000);
};

// Check if token is expired
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  return expiration < new Date();
};

module.exports = {
  jwtConfig,
  validateJWTConfig,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired
};