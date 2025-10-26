// FILE: backend/src/controllers/ideaController.js
// FILE: backend/src/controllers/ideaController.js
const Idea = require("../models/Idea");
const Evaluation = require("../models/Evaluation");
const User = require("../models/User");
const emailService = require("../services/emailService");

// Create/Update idea (save draft or update)
exports.saveIdea = async (req, res, next) => {
  try {
    const { title, abstract, problem, solution, team } = req.body;
    const { id } = req.params;

    let idea;

    if (id) {
      // Update existing idea
      idea = await Idea.findOne({ _id: id, founderId: req.user.id });

      if (!idea) {
        return res.status(404).json({ error: "Idea not found" });
      }

      // ✅ CHANGED: Allow editing in more states, but with notifications
      const editableStatuses = ['draft', 'rejected', 'submitted', 'under_review'];
      if (!editableStatuses.includes(idea.status)) {
        return res.status(400).json({
          error: "Cannot edit approved ideas. Please contact admin if changes are needed.",
        });
      }

      // Store old values for comparison
      const oldValues = {
        title: idea.title,
        abstract: idea.abstract,
        problem: idea.problem,
        solution: idea.solution,
        team: idea.team,
      };

      // Update fields
      idea.title = title || idea.title;
      idea.abstract = abstract || idea.abstract;
      idea.problem = problem || idea.problem;
      idea.solution = solution || idea.solution;
      idea.team = team || idea.team;

      // ✅ NEW: If idea was submitted/under_review and content changed, notify admin and evaluators
      if (['submitted', 'under_review'].includes(idea.status)) {
        const hasChanges = 
          oldValues.title !== idea.title ||
          oldValues.abstract !== idea.abstract ||
          oldValues.problem !== idea.problem ||
          oldValues.solution !== idea.solution ||
          oldValues.team !== idea.team;

        if (hasChanges) {
          // Notify admin about changes
          const admins = await User.find({ roles: 'admin' });
          for (const admin of admins) {
            await emailService.sendIdeaUpdatedNotification(
              admin.email,
              admin.fullName,
              idea.title,
              req.user.fullName,
              idea._id
            );
          }

          // Notify assigned evaluators
          if (idea.assignedEvaluators && idea.assignedEvaluators.length > 0) {
            const evaluators = await User.find({ 
              _id: { $in: idea.assignedEvaluators } 
            });
            
            for (const evaluator of evaluators) {
              await emailService.sendIdeaUpdatedToEvaluator(
                evaluator.email,
                evaluator.fullName,
                idea.title,
                idea._id
              );
            }
          }
        }
      }

      await idea.save();
    } else {
      // Create new idea
      idea = await Idea.create({
        founderId: req.user.id,
        title,
        abstract,
        problem,
        solution,
        team,
        status: "draft",
      });
    }

    res.json({
      message: id ? "Idea updated successfully" : "Idea created successfully",
      idea,
    });
  } catch (error) {
    next(error);
  }
};



// Submit idea for review
exports.submitIdea = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({ _id: id, founderId: req.user.id });

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    if (!["draft", "rejected"].includes(idea.status)) {
      return res
        .status(400)
        .json({
          error: "This idea has already been submitted or is under review",
        });
    }

    // Validate all required fields
    if (
      !idea.title ||
      !idea.abstract ||
      !idea.problem ||
      !idea.solution ||
      !idea.team
    ) {
      return res
        .status(400)
        .json({
          error: "Please complete all required fields before submitting",
        });
    }

    idea.submit();
    await idea.save();

    // Send confirmation email to founder
    await emailService.sendIdeaSubmittedEmail(
      req.user.email,
      req.user.fullName,
      idea.title
    );

    // Notify admins about new submission
    const admins = await User.find({ roles: "admin" });
    for (const admin of admins) {
      await emailService.sendNewSubmissionNotification(
        admin.email,
        admin.fullName,
        idea.title,
        req.user.fullName,
        idea._id
      );
    }

    res.json({ message: "Idea submitted successfully", idea });
  } catch (error) {
    next(error);
  }
};

// Get my ideas (founder)
exports.getMyIdeas = async (req, res, next) => {
  try {
    const ideas = await Idea.find({ founderId: req.user.id }).sort({
      createdAt: -1,
    });

    // Get evaluation counts and details
    const ideasWithStats = await Promise.all(
      ideas.map(async (idea) => {
        const evaluations = await Evaluation.find({
          ideaId: idea._id,
          status: "completed",
        }).populate("evaluatorId", "fullName");

        return {
          ...idea.toObject(),
          evaluationCount: evaluations.length,
          evaluations: evaluations.map((e) => ({
            evaluatorName: e.evaluatorId.fullName,
            averageScore: e.averageScore,
            comments: e.comments,
            submittedAt: e.submittedAt,
          })),
        };
      })
    );

    res.json({ ideas: ideasWithStats });
  } catch (error) {
    next(error);
  }
};

// Get idea by ID
exports.getIdeaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findById(id)
      .populate("founderId", "fullName email")
      .populate("assignedEvaluators", "fullName email");

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    // Check permissions
    const isFounder = idea.founderId._id.toString() === req.user.id;
    const isAssignedEvaluator = idea.assignedEvaluators.some(
      (e) => e._id.toString() === req.user.id
    );
    const isAdmin = req.user.roles.includes("admin");

    if (!isFounder && !isAssignedEvaluator && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this idea" });
    }

    // Get evaluations if founder or admin
    let evaluations = [];
    if (isFounder || isAdmin) {
      evaluations = await Evaluation.find({ ideaId: id, status: "completed" })
        .populate("evaluatorId", "fullName")
        .select("-evaluatorId.email");
    }

    res.json({ idea, evaluations });
  } catch (error) {
    next(error);
  }
};

// Delete idea (only drafts and rejected)
exports.deleteIdea = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({ _id: id, founderId: req.user.id });

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    if (!["draft", "rejected"].includes(idea.status)) {
      return res.status(400).json({
        error:
          "Cannot delete ideas that are submitted, under review, or approved. You can only delete draft or rejected ideas.",
      });
    }

    // Delete associated evaluations
    await Evaluation.deleteMany({ ideaId: id });

    await Idea.findByIdAndDelete(id);

    res.json({ message: "Idea deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Upload pitch deck
exports.uploadPitchDeck = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const idea = await Idea.findOne({ _id: id, founderId: req.user.id });

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    if (!["draft", "rejected"].includes(idea.status)) {
      return res.status(400).json({ error: "Cannot update submitted ideas" });
    }

    idea.pitchDeck = req.file.path;
    await idea.save();

    res.json({
      message: "Pitch deck uploaded successfully",
      filePath: req.file.path,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
