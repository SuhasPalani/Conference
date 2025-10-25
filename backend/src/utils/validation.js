const validator = require('validator');

// Email validation
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return validator.isEmail(email);
};

// Password validation with strength requirements
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }

  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }

  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Full name validation
const validateFullName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return { isValid: false, error: 'Full name is required' };
  }

  const trimmed = fullName.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Full name cannot be empty' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Full name must be less than 100 characters' };
  }

  return { isValid: true };
};

// ObjectId validation (MongoDB)
const validateObjectId = (id) => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id.toString());
};

// URL validation
const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

// Phone number validation (optional, for future use)
const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  return validator.isMobilePhone(phone, 'any');
};

// Text length validation
const validateTextLength = (text, minLength = 0, maxLength = Infinity) => {
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Text must be a string' };
  }

  const length = text.trim().length;

  if (length < minLength) {
    return { 
      isValid: false, 
      error: `Text must be at least ${minLength} characters` 
    };
  }

  if (length > maxLength) {
    return { 
      isValid: false, 
      error: `Text must be less than ${maxLength} characters` 
    };
  }

  return { isValid: true };
};

// Idea validation
const validateIdea = (idea) => {
  const errors = [];

  // Title validation
  const titleValidation = validateTextLength(idea.title, 1, 100);
  if (!titleValidation.isValid) {
    errors.push(`Title: ${titleValidation.error}`);
  }

  // Abstract validation
  const abstractValidation = validateTextLength(idea.abstract, 50, 500);
  if (!abstractValidation.isValid) {
    errors.push(`Abstract: ${abstractValidation.error}`);
  }

  // Problem validation
  const problemValidation = validateTextLength(idea.problem, 50, 1000);
  if (!problemValidation.isValid) {
    errors.push(`Problem: ${problemValidation.error}`);
  }

  // Solution validation
  const solutionValidation = validateTextLength(idea.solution, 50, 1000);
  if (!solutionValidation.isValid) {
    errors.push(`Solution: ${solutionValidation.error}`);
  }

  // Team validation
  const teamValidation = validateTextLength(idea.team, 20, 500);
  if (!teamValidation.isValid) {
    errors.push(`Team: ${teamValidation.error}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Evaluation scores validation
const validateEvaluationScores = (scores) => {
  const errors = [];
  const requiredFields = ['innovation', 'feasibility', 'impact', 'presentation'];

  if (!scores || typeof scores !== 'object') {
    return { 
      isValid: false, 
      errors: ['Scores object is required'] 
    };
  }

  // Check all required fields exist
  for (const field of requiredFields) {
    if (!(field in scores)) {
      errors.push(`${field} score is required`);
    }
  }

  // Validate each score is between 1 and 10
  for (const field of requiredFields) {
    const score = scores[field];
    
    if (typeof score !== 'number') {
      errors.push(`${field} must be a number`);
      continue;
    }

    if (score < 1 || score > 10) {
      errors.push(`${field} must be between 1 and 10`);
    }

    if (!Number.isInteger(score)) {
      errors.push(`${field} must be a whole number`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Comments validation
const validateComments = (comments) => {
  if (!comments) {
    return { isValid: true }; // Comments are optional
  }

  return validateTextLength(comments, 0, 1000);
};

// Role validation
const validateRole = (role) => {
  const validRoles = ['basic', 'founder', 'evaluator', 'admin'];
  
  if (!role || typeof role !== 'string') {
    return { isValid: false, error: 'Role must be a string' };
  }

  if (!validRoles.includes(role)) {
    return { 
      isValid: false, 
      error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
    };
  }

  return { isValid: true };
};

// Roles array validation
const validateRoles = (roles) => {
  if (!Array.isArray(roles)) {
    return { 
      isValid: false, 
      errors: ['Roles must be an array'] 
    };
  }

  if (roles.length === 0) {
    return { 
      isValid: false, 
      errors: ['At least one role is required'] 
    };
  }

  const errors = [];
  const validRoles = ['basic', 'founder', 'evaluator', 'admin'];

  for (const role of roles) {
    if (!validRoles.includes(role)) {
      errors.push(`Invalid role: ${role}`);
    }
  }

  // Ensure 'basic' is always included
  if (!roles.includes('basic')) {
    errors.push("'basic' role is required for all users");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Status validation
const validateIdeaStatus = (status) => {
  const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
  
  if (!validStatuses.includes(status)) {
    return { 
      isValid: false, 
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    };
  }

  return { isValid: true };
};

// Sanitize input (remove HTML tags, trim whitespace)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Sanitize object (sanitize all string properties)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};

// Validate pagination parameters
const validatePagination = (page, limit) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 20;

  if (parsedPage < 1) {
    return { page: 1, limit: parsedLimit };
  }

  if (parsedLimit < 1 || parsedLimit > 100) {
    return { page: parsedPage, limit: 20 };
  }

  return { page: parsedPage, limit: parsedLimit };
};

// Validate search query
const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Search query must be a string' };
  }

  if (query.trim().length === 0) {
    return { isValid: false, error: 'Search query cannot be empty' };
  }

  if (query.length > 100) {
    return { isValid: false, error: 'Search query too long (max 100 characters)' };
  }

  return { isValid: true, sanitized: sanitizeInput(query) };
};

module.exports = {
  // Basic validations
  validateEmail,
  validatePassword,
  validateFullName,
  validateObjectId,
  validateUrl,
  validatePhoneNumber,
  validateTextLength,
  
  // Domain-specific validations
  validateIdea,
  validateEvaluationScores,
  validateComments,
  validateRole,
  validateRoles,
  validateIdeaStatus,
  
  // Sanitization
  sanitizeInput,
  sanitizeObject,
  
  // Query validations
  validatePagination,
  validateSearchQuery
};