const nodemailer = require('nodemailer');

// Create SMTP transporter
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not configured. Email service will not work.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // For development - remove in production
    }
  });

  console.log('✅ SMTP email transporter configured');
  return transporter;
};

// Email configuration
const emailConfig = {
  transporter: createTransporter(),
  sender: {
    name: process.env.SMTP_SENDER_NAME || 'mAIple Conference',
    email: process.env.SMTP_SENDER_EMAIL || process.env.SMTP_USER || 'noreply@maipleconf.com'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

// Validate email configuration
const validateEmailConfig = () => {
  const errors = [];

  if (!process.env.SMTP_HOST) {
    errors.push('SMTP_HOST is not set');
  }

  if (!process.env.SMTP_USER) {
    errors.push('SMTP_USER is not set');
  }

  if (!process.env.SMTP_PASS) {
    errors.push('SMTP_PASS is not set');
  }

  if (errors.length > 0) {
    console.warn('⚠️  Email configuration issues:');
    errors.forEach(error => console.warn(`   - ${error}`));
    return false;
  }

  return true;
};

// Test email connection
const testConnection = async () => {
  if (!emailConfig.transporter) {
    return false;
  }

  try {
    await emailConfig.transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return false;
  }
};

// Check if email service is enabled
const isEmailEnabled = () => {
  return emailConfig.transporter !== null && validateEmailConfig();
};

module.exports = {
  emailConfig,
  validateEmailConfig,
  isEmailEnabled,
  testConnection
};