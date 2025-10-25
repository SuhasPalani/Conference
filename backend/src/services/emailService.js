const { emailConfig } = require("../config/email");

// Helper function to send email
const sendEmail = async (to, subject, htmlContent) => {
  if (!emailConfig.transporter) {
    console.warn(
      "⚠️  Email transporter not configured. Skipping email to:",
      to
    );
    return false;
  }

  const mailOptions = {
    from: `"${emailConfig.sender.name}" <${emailConfig.sender.email}>`,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  try {
    const info = await emailConfig.transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${subject}`);
    console.log("   Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    return false;
  }
};

// Welcome email
exports.sendWelcomeEmail = async (email, fullName) => {
  const subject = "Welcome to mAIple AI Conference!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Welcome to mAIple! 🍁</h1>
      <p>Hi ${fullName},</p>
      <p>Thank you for joining the mAIple AI Conference portal. We're excited to have you as part of our innovative community!</p>
      <p>Your account has been created with basic access. An administrator will review and assign appropriate roles based on your participation.</p>
      <h3>What's Next?</h3>
      <ul>
        <li><strong>Founders:</strong> Once assigned the founder role, you can submit your AI ideas</li>
        <li><strong>Evaluators:</strong> Review and score innovative submissions</li>
        <li><strong>Attendees:</strong> Stay updated with conference news and schedule</li>
      </ul>
      <p>Visit your dashboard to get started: <a href="${emailConfig.frontendUrl}/dashboard">Dashboard</a></p>
      <p>Best regards,<br>The mAIple Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Email verification
exports.sendVerificationEmail = async (email, fullName, token) => {
  const verificationUrl = `${emailConfig.frontendUrl}/verify-email/${token}`;
  const subject = "Verify Your Email - mAIple Conference";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Verify Your Email 📧</h1>
      <p>Hi ${fullName},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: linear-gradient(135deg, #ff6b35 0%, #e84118 100%); 
                  color: white; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p><strong>This link expires in 24 hours.</strong></p>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>Best regards,<br>The mAIple Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Password reset
exports.sendPasswordResetEmail = async (email, fullName, token) => {
  const resetUrl = `${emailConfig.frontendUrl}/reset-password/${token}`;
  const subject = "Reset Your Password - mAIple Conference";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Reset Your Password 🔒</h1>
      <p>Hi ${fullName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background: linear-gradient(135deg, #ff6b35 0%, #e84118 100%); 
                  color: white; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p><strong>This link expires in 1 hour.</strong></p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
      <p>Best regards,<br>The mAIple Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Idea submission confirmation
exports.sendIdeaSubmittedEmail = async (email, fullName, ideaTitle) => {
  const subject = "Idea Submitted Successfully!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Idea Submitted! 💡</h1>
      <p>Hi ${fullName},</p>
      <p>Your idea "<strong>${ideaTitle}</strong>" has been successfully submitted for review.</p>
      <p><strong>What happens next?</strong></p>
      <ol>
        <li>Our expert evaluators will review your submission</li>
        <li>You'll receive feedback and scores within 5-7 business days</li>
        <li>Top ideas will be selected for the pitch competition</li>
      </ol>
      <p>You can track your submission status in your dashboard: <a href="${emailConfig.frontendUrl}/dashboard">View Dashboard</a></p>
      <p>Good luck! 🌟</p>
      <p>Best regards,<br>The mAIple Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Idea assigned to evaluator
exports.sendIdeaAssignedEmail = async (email, fullName, ideaTitle, ideaId) => {
  const evaluateUrl = `${emailConfig.frontendUrl}/evaluate/${ideaId}`;
  const subject = "New Idea Assigned for Evaluation";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">New Evaluation Assignment 📋</h1>
      <p>Hi ${fullName},</p>
      <p>A new idea has been assigned to you for evaluation:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0;">${ideaTitle}</h3>
      </div>
      <p>Please review and provide your evaluation at your earliest convenience.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${evaluateUrl}" 
           style="background: linear-gradient(135deg, #ff6b35 0%, #e84118 100%); 
                  color: white; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  display: inline-block;">
          Start Evaluation
        </a>
      </div>
      <p><strong>Evaluation Criteria:</strong></p>
      <ul>
        <li>Innovation (1-10)</li>
        <li>Feasibility (1-10)</li>
        <li>Impact (1-10)</li>
        <li>Presentation (1-10)</li>
      </ul>
      <p>Thank you for your contribution to mAIple!</p>
      <p>Best regards,<br>The mAIple Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Evaluation completed notification to admin
exports.sendEvaluationCompletedEmail = async (
  adminEmail,
  evaluatorName,
  ideaTitle
) => {
  const subject = "Evaluation Completed - Admin Notification";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Evaluation Completed ✅</h1>
      <p>Hello Admin,</p>
      <p><strong>${evaluatorName}</strong> has completed their evaluation for:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0;">${ideaTitle}</h3>
      </div>
      <p>View details in the admin dashboard: <a href="${emailConfig.frontendUrl}/admin">Admin Dashboard</a></p>
      <p>Best regards,<br>mAIple System</p>
    </div>
  `;
  return await sendEmail(adminEmail, subject, html);
};

// Idea status changed notification
exports.sendIdeaStatusChangedEmail = async (
  email,
  fullName,
  ideaTitle,
  newStatus
) => {
  const statusMessages = {
    under_review: "Your idea is now under review by our evaluators.",
    approved:
      "🎉 Congratulations! Your idea has been approved for the pitch competition!",
    rejected:
      "Unfortunately, your idea was not selected for this round. We encourage you to refine and resubmit.",
  };

  const subject = `Idea Status Update: ${ideaTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Idea Status Update</h1>
      <p>Hi ${fullName},</p>
      <p>The status of your idea "<strong>${ideaTitle}</strong>" has been updated to: <strong>${newStatus}</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;">${
          statusMessages[newStatus] || "Status updated."
        }</p>
      </div>
      <p>View more details: <a href="${
        emailConfig.frontendUrl
      }/dashboard">Dashboard</a></p>
      <p>Best regards,<br>The mAIple Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

// Role assignment notification
exports.sendRoleAssignedEmail = async (email, fullName, roles) => {
  const subject = "Your mAIple Roles Have Been Updated";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ff6b35;">Roles Updated 🎭</h1>
      <p>Hi ${fullName},</p>
      <p>Your roles on the mAIple platform have been updated:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>Your current roles:</strong>
        <ul>
          ${roles
            .map(
              (role) =>
                `<li>${role.charAt(0).toUpperCase() + role.slice(1)}</li>`
            )
            .join("")}
        </ul>
      </div>
      <p>Log in to explore your new capabilities: <a href="${
        emailConfig.frontendUrl
      }/login">Login</a></p>
      <p>Best regards,<br>The mAIple Team</p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};
