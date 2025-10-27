// FILE: backend/src/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  authLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimit");

// Public routes
router.post("/register", authLimiter, authController.register);
router.post("/verify-otp", authLimiter, authController.verifyOTP);
router.post("/resend-otp", authLimiter, authController.resendOTP);
router.post("/login", authLimiter, authController.login);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  authController.forgotPassword
);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);

// Protected routes
router.get("/me", protect, authController.getMe);
router.post("/logout", protect, authController.logout);

module.exports = router;
