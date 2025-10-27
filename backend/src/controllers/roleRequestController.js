// FILE: backend/src/controllers/roleRequestController.js
const User = require("../models/User");
const Notification = require("../models/Notification");
const emailService = require("../services/emailService");

// Submit role request
exports.submitRoleRequest = async (req, res, next) => {
  try {
    const { role, reason, previousWork } = req.body;

    if (!role || !reason) {
      return res.status(400).json({ error: "Role and reason are required" });
    }

    if (!["founder", "evaluator"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'founder' or 'evaluator'" });
    }

    if (reason.length < 50) {
      return res
        .status(400)
        .json({ error: "Reason must be at least 50 characters" });
    }

    const user = await User.findById(req.user.id);

    // Check if user already has this role
    if (user.hasRole(role)) {
      return res
        .status(400)
        .json({ error: `You already have the ${role} role` });
    }

    // Check if there's already a pending request for this role
    const existingRequest = user.roleRequests.find(
      (req) => req.role === role && req.status === "pending"
    );

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: `You already have a pending ${role} request` });
    }

    // Add role request
    user.roleRequests.push({
      role,
      reason,
      previousWork: previousWork || "",
      status: "pending",
      requestedAt: new Date(),
    });

    await user.save();

    // Notify all admins
    const admins = await User.find({ roles: "admin" });
    for (const admin of admins) {
      // Create notification
      await Notification.create({
        userId: admin._id,
        type: "role_request",
        title: "New Role Request",
        message: `${user.fullName} has requested ${role} role`,
        link: `/admin?tab=role-requests&userId=${user._id}`,
        metadata: {
          requestedBy: user._id,
          role,
          userName: user.fullName,
        },
      });

      // Send email
      await emailService.sendRoleRequestNotification(
        admin.email,
        admin.fullName,
        user.fullName,
        user.email,
        role,
        reason
      );
    }

    res.json({
      message:
        "Role request submitted successfully. Admins will review your request.",
      roleRequest: user.roleRequests[user.roleRequests.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

// Get my role requests
exports.getMyRoleRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ roleRequests: user.roleRequests });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
