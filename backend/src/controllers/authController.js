const User = require("../models/User");
const Token = require("../models/Token");
const { generateAccessToken } = require("../config/jwt");
const emailService = require("../services/emailService");
const {
  validateEmail,
  validatePassword,
  validateFullName,
} = require("../utils/validation");
const { getClientIp, getUserAgent } = require("../utils/helpers");

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

    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      roles: ["basic"],
    });

    // Generate verification token
    const verificationToken = await Token.generateVerificationToken(user._id);

    // Send verification email
    await emailService.sendVerificationEmail(
      email,
      fullName,
      verificationToken.token
    );
    await emailService.sendWelcomeEmail(email, fullName);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token with appropriate expiration
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

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const tokenDoc = await Token.verifyAndUseToken(token, "verification");

    if (!tokenDoc) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully" });
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
      // Don't reveal if email exists
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

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res
        .status(400)
        .json({ error: passwordValidation.errors.join(", ") });
    }

    const tokenDoc = await Token.verifyAndUseToken(token, "password_reset");

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

    res.json({ message: "Password reset successful" });
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

// Logout (client-side mainly, but can invalidate token here if needed)
exports.logout = async (req, res, next) => {
  try {
    // In a more complex setup, you might invalidate the token in a blacklist
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

    // Generate new token
    const newToken = generateAccessToken(user._id);

    res.json({ token: newToken });
  } catch (error) {
    return res.status(401).json({ error: "Token refresh failed" });
  }
};
