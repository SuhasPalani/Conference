// FILE: backend/src/controllers/authController.js
const User = require("../models/User");
const Token = require("../models/Token");
const { generateAccessToken } = require("../config/jwt");
const emailService = require("../services/emailService");
const {
  validateEmail,
  validatePassword,
  validateFullName,
} = require("../utils/validation");

// Register user
exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res
        .status(400)
        .json({ error: passwordValidation.errors.join(", ") });
    }

    const nameValidation = validateFullName(fullName);
    if (!nameValidation.isValid) {
      return res.status(400).json({ error: nameValidation.error });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user as unverified basic user
    const user = await User.create({
      email,
      password,
      fullName,
      roles: ["basic"],
      isVerified: false,
    });

    // Generate OTP
    const otpToken = await Token.generateOTP(user._id);

    // Send OTP email
    await emailService.sendOTPEmail(email, fullName, otpToken.token);

    res.status(201).json({
      message:
        "Registration successful. Please check your email for OTP verification.",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Verify OTP
    const tokenDoc = await Token.verifyOTP(user._id, otp);

    if (!tokenDoc) {
      return res.status(400).json({
        error: "Invalid or expired OTP. Please request a new one.",
      });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.fullName);

    // Generate auth token
    const token = generateAccessToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully! You can now login.",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If that email exists, a new OTP has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Invalidate old OTPs
    await Token.invalidateUserTokens(user._id, "otp_verification");

    // Generate new OTP
    const otpToken = await Token.generateOTP(user._id);

    // Send OTP email
    await emailService.sendOTPEmail(email, user.fullName, otpToken.token);

    res.json({
      message: "New OTP sent. Please check your email.",
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Resend OTP
      await Token.invalidateUserTokens(user._id, "otp_verification");
      const otpToken = await Token.generateOTP(user._id);
      await emailService.sendOTPEmail(email, user.fullName, otpToken.token);

      return res.status(403).json({
        error: "Please verify your email address before logging in.",
        needsVerification: true,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const expiresIn = rememberMe
      ? process.env.JWT_REFRESH_EXPIRE
      : process.env.JWT_EXPIRE;
    const token = generateAccessToken(user._id, expiresIn);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = await Token.generatePasswordResetToken(user._id);

    // Send email
    await emailService.sendPasswordResetEmail(
      email,
      user.fullName,
      resetToken.token
    );

    res.json({ message: "If that email exists, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res
        .status(400)
        .json({ error: passwordValidation.errors.join(", ") });
    }

    const tokenDoc = await Token.findOne({
      token,
      type: "password_reset",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Set new password
    user.password = password;
    await user.save();

    // Mark token as used
    tokenDoc.isUsed = true;
    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { verifyToken } = require("../config/jwt");
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Email not verified",
        needsVerification: true,
      });
    }

    // Generate new token
    const newToken = generateAccessToken(user._id);

    res.json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ error: "Token refresh failed" });
  }
};

module.exports = exports;
