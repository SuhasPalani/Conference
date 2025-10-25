const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure Brevo (Sendinblue) API client
const configureBrevoClient = () => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  
  if (!process.env.BREVO_API_KEY) {
    console.warn('⚠️  BREVO_API_KEY not configured. Email service will not work.');
    return null;
  }

  apiKey.apiKey = process.env.BREVO_API_KEY;
  
  console.log('✅ Brevo email client configured');
  return new SibApiV3Sdk.TransactionalEmailsApi();
};

// Email configuration
const emailConfig = {
  apiInstance: configureBrevoClient(),
  sender: {
    name: process.env.BREVO_SENDER_NAME || 'mAIple Conference',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@maipleconf.com'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

// Validate email configuration
const validateEmailConfig = () => {
  const errors = [];

  if (!process.env.BREVO_API_KEY) {
    errors.push('BREVO_API_KEY is not set');
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    errors.push('BREVO_SENDER_EMAIL is not set');
  }

  if (errors.length > 0) {
    console.warn('⚠️  Email configuration issues:');
    errors.forEach(error => console.warn(`   - ${error}`));
    return false;
  }

  return true;
};

// Check if email service is enabled
const isEmailEnabled = () => {
  return emailConfig.apiInstance !== null && validateEmailConfig();
};

module.exports = {
  emailConfig,
  validateEmailConfig,
  isEmailEnabled
};