const crypto = require('crypto');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate random number
const generateRandomNumber = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Hash string (for tokens, etc)
const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

// Sleep/delay function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Capitalize first letter
const capitalizeFirst = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Capitalize each word
const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

// Format date to readable string
const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleDateString('en-US', options);
};

// Format date to ISO string
const formatDateISO = (date) => {
  if (!date) return '';
  return new Date(date).toISOString();
};

// Get time ago string (e.g., "2 hours ago")
const getTimeAgo = (date) => {
  if (!date) return '';

  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

// Check if date is in past
const isPast = (date) => {
  return new Date(date) < new Date();
};

// Check if date is in future
const isFuture = (date) => {
  return new Date(date) > new Date();
};

// Add days to date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Subtract days from date
const subtractDays = (date, days) => {
  return addDays(date, -days);
};

// Get days difference between two dates
const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Truncate string with ellipsis
const truncate = (str, length = 50) => {
  if (!str || typeof str !== 'string') return str;
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

// Remove special characters from string
const removeSpecialChars = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

// Convert string to slug
const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate initials from name
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Parse JSON safely
const parseJSON = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Remove null/undefined values from object
const removeEmpty = (obj) => {
  return Object.entries(obj)
    .filter(([_, value]) => value != null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Pick specific keys from object
const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

// Omit specific keys from object
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// Group array by key
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// Sort array by key
const sortBy = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
};

// Calculate average from array of numbers
const average = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

// Round number to decimal places
const roundTo = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Format number with commas
const formatNumber = (number) => {
  if (typeof number !== 'number') return number;
  return number.toLocaleString('en-US');
};

// Calculate percentage
const percentage = (value, total) => {
  if (total === 0) return 0;
  return roundTo((value / total) * 100, 2);
};

// Generate pagination metadata
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

// Extract pagination params from query
const extractPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Async retry function
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await sleep(delay * attempt);
    }
  }
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get IP address from request
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Get user agent from request
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

// Create success response
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

// Create error response
const errorResponse = (message, errors = null) => {
  const response = {
    success: false,
    error: message
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

// Mask email (e.g., j***@example.com)
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return email;
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const maskedUsername = username.charAt(0) + '***' + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

// Generate random color (hex)
const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

module.exports = {
  // Random generation
  generateRandomString,
  generateRandomNumber,
  hashString,
  generateRandomColor,
  
  // String manipulation
  capitalizeFirst,
  capitalizeWords,
  truncate,
  removeSpecialChars,
  slugify,
  getInitials,
  maskEmail,
  
  // Date utilities
  formatDate,
  formatDateISO,
  getTimeAgo,
  isPast,
  isFuture,
  addDays,
  subtractDays,
  getDaysDifference,
  
  // Object utilities
  parseJSON,
  deepClone,
  isEmpty,
  removeEmpty,
  pick,
  omit,
  
  // Array utilities
  groupBy,
  sortBy,
  
  // Number utilities
  average,
  roundTo,
  formatNumber,
  percentage,
  
  // Pagination
  getPaginationMeta,
  extractPaginationParams,
  
  // Request utilities
  getClientIp,
  getUserAgent,
  
  // Response utilities
  successResponse,
  errorResponse,
  
  // Async utilities
  sleep,
  retry,
  debounce
};