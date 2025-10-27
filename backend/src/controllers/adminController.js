// FILE: backend/src/controllers/adminController.js
const User = require("../models/User");
const Idea = require("../models/Idea");
const Evaluation = require("../models/Evaluation");
const emailService = require("../services/emailService");
const Notification = require("../models/Notification");
// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query = {};

    if (role) {
      query.roles = role;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's ideas if founder
    let ideas = [];
    if (user.roles.includes("founder")) {
      ideas = await Idea.find({ founderId: user._id });
    }

    // Get user's evaluations if evaluator
    let evaluations = [];
    if (user.roles.includes("evaluator")) {
      evaluations = await Evaluation.find({ evaluatorId: user._id }).populate(
        "ideaId",
        "title"
      );
    }

    res.json({ user, ideas, evaluations });
  } catch (error) {
    next(error);
  }
};

// Assign/update user roles
exports.updateUserRoles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;

    // Validate roles
    const validRoles = ["basic", "founder", "evaluator", "admin"];
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));

    if (invalidRoles.length > 0) {
      return res.status(400).json({
        error: `Invalid roles: ${invalidRoles.join(", ")}`,
      });
    }

    // Ensure basic role is always included
    if (!roles.includes("basic")) {
      roles.push("basic");
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent removing admin role from the last admin
    if (user.roles.includes("admin") && !roles.includes("admin")) {
      const adminCount = await User.countDocuments({ roles: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: "Cannot remove admin role from the last admin user",
        });
      }
    }

    user.roles = roles;
    await user.save();

    // Send notification email
    await emailService.sendRoleAssignedEmail(user.email, user.fullName, roles);

    res.json({
      message: "User roles updated successfully",
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

// Get all ideas with filters
exports.getAllIdeas = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { abstract: { $regex: search, $options: "i" } },
      ];
    }

    const ideas = await Idea.find(query)
      .populate("founderId", "fullName email")
      .populate("assignedEvaluators", "fullName email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Idea.countDocuments(query);

    res.json({
      ideas,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// Update idea status
exports.updateIdeaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "draft",
      "submitted",
      "under_review",
      "approved",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const idea = await Idea.findById(id).populate("founderId");

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    const oldStatus = idea.status;
    idea.status = status;
    await idea.save();

    // Send notification if status changed significantly
    if (
      ["under_review", "approved", "rejected"].includes(status) &&
      oldStatus !== status
    ) {
      await emailService.sendIdeaStatusChangedEmail(
        idea.founderId.email,
        idea.founderId.fullName,
        idea.title,
        status,
        req.user.fullName
      );
    }

    res.json({ message: "Idea status updated successfully", idea });
  } catch (error) {
    next(error);
  }
};

// Assign evaluators to idea with queue system
exports.assignEvaluators = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { evaluatorIds, autoAssign } = req.body;

    const idea = await Idea.findById(id);

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    let finalEvaluatorIds = evaluatorIds || [];

    // Auto-assign using queue system if requested
    if (autoAssign) {
      const evaluators = await User.find({ roles: "evaluator" });

      if (evaluators.length === 0) {
        return res.status(400).json({ error: "No evaluators available" });
      }

      // Get workload for each evaluator (pending evaluations)
      const evaluatorWorkload = await Promise.all(
        evaluators.map(async (evaluator) => {
          const pendingCount = await Evaluation.countDocuments({
            evaluatorId: evaluator._id,
            status: "pending",
          });
          return {
            id: evaluator._id,
            name: evaluator.fullName,
            workload: pendingCount,
          };
        })
      );

      // Sort by workload (min heap simulation)
      evaluatorWorkload.sort((a, b) => a.workload - b.workload);

      // Assign to evaluator with least workload (max 3 at a time)
      const availableEvaluators = evaluatorWorkload.filter(
        (e) => e.workload < 3
      );

      if (availableEvaluators.length === 0) {
        return res.status(400).json({
          error:
            "All evaluators are at maximum capacity (3 pending evaluations each). Please wait or assign manually.",
        });
      }

      // Assign to the one with least workload
      finalEvaluatorIds = [availableEvaluators[0].id];

      console.log(
        `Auto-assigned to ${availableEvaluators[0].name} (current workload: ${availableEvaluators[0].workload})`
      );
    }

    // Verify all evaluators exist and have evaluator role
    const evaluators = await User.find({
      _id: { $in: finalEvaluatorIds },
      roles: "evaluator",
    });

    if (evaluators.length !== finalEvaluatorIds.length) {
      return res.status(400).json({
        error:
          "One or more invalid evaluator IDs or users without evaluator role",
      });
    }

    // Update idea
    idea.assignedEvaluators = finalEvaluatorIds;
    if (idea.status === "submitted") {
      idea.status = "under_review";
    }
    await idea.save();

    // Create evaluation records for new evaluators
    for (const evaluatorId of finalEvaluatorIds) {
      const existingEvaluation = await Evaluation.findOne({
        ideaId: id,
        evaluatorId,
      });

      if (!existingEvaluation) {
        // ✅ FIX: Don't set scores for pending evaluations
        const newEvaluation = await Evaluation.create({
          ideaId: id,
          evaluatorId,
          status: "pending",
          // Scores will be set when evaluator submits
        });

        console.log("✅ Created evaluation:", newEvaluation._id);

        const evaluator = evaluators.find(
          (e) => e._id.toString() === evaluatorId.toString()
        );

        if (evaluator) {
          // Create notification
          await Notification.create({
            userId: evaluator._id,
            type: "idea_assigned",
            title: "New Idea Assigned",
            message: `You have been assigned to evaluate: ${idea.title}`,
            link: `/evaluate?id=${idea._id}`,
            metadata: {
              ideaId: idea._id,
              ideaTitle: idea.title,
            },
          });

          // Send email
          try {
            await emailService.sendIdeaAssignedEmail(
              evaluator.email,
              evaluator.fullName,
              idea.title,
              idea._id.toString()
            );
          } catch (emailError) {
            console.error("Failed to send assignment email:", emailError);
          }
        }
      }
    }

    res.json({
      message: autoAssign
        ? `Idea automatically assigned to evaluator with least workload`
        : "Evaluators assigned successfully",
      idea: await Idea.findById(id)
        .populate("assignedEvaluators", "fullName email")
        .populate("founderId", "fullName email"),
    });
  } catch (error) {
    console.error("Assignment error:", error);
    next(error);
  }
};

exports.getAllRoleRequests = async (req, res, next) => {
  try {
    const { status, role } = req.query;

    const query = {};
    if (status) {
      query["roleRequests.status"] = status;
    }
    if (role) {
      query["roleRequests.role"] = role;
    }

    const users = await User.find({
      "roleRequests.0": { $exists: true },
    }).select("fullName email roleRequests createdAt");

    // Flatten role requests with user info
    const roleRequests = [];
    users.forEach((user) => {
      user.roleRequests.forEach((request) => {
        if (!status || request.status === status) {
          if (!role || request.role === role) {
            roleRequests.push({
              _id: request._id,
              user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
              },
              ...request.toObject(),
            });
          }
        }
      });
    });

    // Sort by requested date (newest first)
    roleRequests.sort(
      (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
    );

    res.json({ roleRequests });
  } catch (error) {
    next(error);
  }
};

// Review role request
exports.reviewRoleRequest = async (req, res, next) => {
  try {
    const { userId, requestId } = req.params;
    const { action, reviewNotes } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Action must be 'approve' or 'reject'" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const request = user.roleRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ error: "Role request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ error: "This request has already been reviewed" });
    }

    // Update request
    request.status = action === "approve" ? "approved" : "rejected";
    request.reviewedAt = new Date();
    request.reviewedBy = req.user.id;
    request.reviewNotes = reviewNotes || "";

    // Add role if approved
    if (action === "approve") {
      user.addRole(request.role);
    }

    await user.save();

    // Create notification for user
    await Notification.create({
      userId: user._id,
      type: action === "approve" ? "role_approved" : "role_rejected",
      title: `Role Request ${action === "approve" ? "Approved" : "Rejected"}`,
      message:
        action === "approve"
          ? `Your ${request.role} role request has been approved!`
          : `Your ${request.role} role request has been rejected. ${
              reviewNotes || ""
            }`,
      metadata: {
        role: request.role,
        reviewedBy: req.user.id,
      },
    });

    // Send email
    await emailService.sendRoleRequestReviewEmail(
      user.email,
      user.fullName,
      request.role,
      action === "approve",
      reviewNotes
    );

    res.json({
      message: `Role request ${action}d successfully`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    next(error);
  }
};
// Get evaluator workload
exports.getEvaluatorWorkload = async (req, res, next) => {
  try {
    const evaluators = await User.find({ roles: "evaluator" });

    const workload = await Promise.all(
      evaluators.map(async (evaluator) => {
        const pending = await Evaluation.countDocuments({
          evaluatorId: evaluator._id,
          status: "pending",
        });
        const completed = await Evaluation.countDocuments({
          evaluatorId: evaluator._id,
          status: "completed",
        });

        return {
          id: evaluator._id,
          name: evaluator.fullName,
          email: evaluator.email,
          pending,
          completed,
          total: pending + completed,
          available: pending < 3,
        };
      })
    );

    // Sort by pending workload
    workload.sort((a, b) => a.pending - b.pending);

    res.json({ workload });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        basic: await User.countDocuments({ roles: "basic" }),
        founders: await User.countDocuments({ roles: "founder" }),
        evaluators: await User.countDocuments({ roles: "evaluator" }),
        admins: await User.countDocuments({ roles: "admin" }),
        verified: await User.countDocuments({ isVerified: true }),
      },
      ideas: {
        total: await Idea.countDocuments(),
        draft: await Idea.countDocuments({ status: "draft" }),
        submitted: await Idea.countDocuments({ status: "submitted" }),
        underReview: await Idea.countDocuments({ status: "under_review" }),
        approved: await Idea.countDocuments({ status: "approved" }),
        rejected: await Idea.countDocuments({ status: "rejected" }),
      },
      evaluations: {
        total: await Evaluation.countDocuments(),
        pending: await Evaluation.countDocuments({ status: "pending" }),
        completed: await Evaluation.countDocuments({ status: "completed" }),
      },
    };

    // Recent activity
    const recentIdeas = await Idea.find()
      .populate("founderId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentEvaluations = await Evaluation.find({ status: "completed" })
      .populate("evaluatorId", "fullName")
      .populate("ideaId", "title")
      .sort({ submittedAt: -1 })
      .limit(5);

    res.json({
      stats,
      recentIdeas,
      recentEvaluations,
    });
  } catch (error) {
    next(error);
  }
};

// Export ideas data
exports.exportIdeas = async (req, res, next) => {
  try {
    const ideas = await Idea.find()
      .populate("founderId", "fullName email")
      .populate("assignedEvaluators", "fullName email");

    // Transform data for export
    const exportData = ideas.map((idea) => ({
      id: idea._id,
      title: idea.title,
      founder: idea.founderId.fullName,
      founderEmail: idea.founderId.email,
      status: idea.status,
      submittedAt: idea.submittedAt,
      evaluatorCount: idea.assignedEvaluators.length,
      averageScore: idea.averageScore || "N/A",
      createdAt: idea.createdAt,
    }));

    res.json({ data: exportData });
  } catch (error) {
    next(error);
  }
};

// Export evaluations data
exports.exportEvaluations = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({ status: "completed" })
      .populate("evaluatorId", "fullName email")
      .populate("ideaId", "title founderId")
      .populate({
        path: "ideaId",
        populate: { path: "founderId", select: "fullName email" },
      });

    // Transform data for export
    const exportData = evaluations.map((evaluation) => ({
      id: evaluation._id,
      ideaTitle: evaluation.ideaId.title,
      founder: evaluation.ideaId.founderId.fullName,
      evaluator: evaluation.evaluatorId.fullName,
      innovationScore: evaluation.scores.innovation,
      feasibilityScore: evaluation.scores.feasibility,
      impactScore: evaluation.scores.impact,
      presentationScore: evaluation.scores.presentation,
      totalScore: evaluation.totalScore,
      averageScore: evaluation.averageScore,
      comments: evaluation.comments,
      submittedAt: evaluation.submittedAt,
    }));

    res.json({ data: exportData });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only - use with caution)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting the last admin
    if (user.roles.includes("admin")) {
      const adminCount = await User.countDocuments({ roles: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          error: "Cannot delete the last admin user",
        });
      }
    }

    // Delete associated data
    await Idea.deleteMany({ founderId: id });
    await Evaluation.deleteMany({ evaluatorId: id });

    await User.findByIdAndDelete(id);

    res.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
