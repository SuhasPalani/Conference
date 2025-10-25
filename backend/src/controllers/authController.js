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

    // Create user - isVerified defaults to FALSE
    const user = await User.create({
      email,
      password,
      fullName,
      roles: ["basic"],
      isVerified: false, // Explicitly set to false
    });

    // Generate verification token
    const verificationToken = await Token.generateVerificationToken(user._id);

    // Send verification email
    await emailService.sendVerificationEmail(
      email,
      fullName,
      verificationToken.token
    );

    // Send welcome email (optional)
    await emailService.sendWelcomeEmail(email, fullName);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        isVerified: user.isVerified, // Should be false
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

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email address before logging in.",
        needsVerification: true,
      });
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

    // Verify and use the token
    const tokenDoc = await Token.verifyAndUseToken(token, "verification");

    if (!tokenDoc) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token" });
    }

    // Find user and verify
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(200).json({
        message: "Email already verified. You can now login.",
        alreadyVerified: true,
      });
    }

    // Set user as verified
    user.isVerified = true;
    await user.save();

    res.json({
      message: "Email verified successfully! You can now login.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        message:
          "If that email exists and is not verified, a verification email has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Invalidate old verification tokens
    await Token.invalidateUserTokens(user._id, "verification");

    // Generate new verification token
    const verificationToken = await Token.generateVerificationToken(user._id);

    // Send verification email
    await emailService.sendVerificationEmail(
      email,
      user.fullName,
      verificationToken.token
    );

    res.json({
      message: "Verification email sent. Please check your inbox.",
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

    // Check if user is verified
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
