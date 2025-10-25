const Evaluation = require("../models/Evaluation");
const Idea = require("../models/Idea");
const User = require("../models/User");
const emailService = require("../services/emailService");

// Get assigned ideas for evaluation
exports.getAssignedIdeas = async (req, res, next) => {
  try {
    const { status } = req.query;

    // Find ideas assigned to this evaluator
    const ideas = await Idea.find({
      assignedEvaluators: req.user.id,
      status: { $in: ["submitted", "under_review"] },
    }).populate("founderId", "fullName"); // Redact founder email

    // Get evaluation status for each idea
    const ideasWithEvalStatus = await Promise.all(
      ideas.map(async (idea) => {
        const evaluation = await Evaluation.findOne({
          ideaId: idea._id,
          evaluatorId: req.user.id,
        });

        // Redact PII from idea
        const ideaObj = idea.toObject();
        delete ideaObj.founderId.email;

        return {
          ...ideaObj,
          evaluationStatus: evaluation ? evaluation.status : "not_started",
          evaluationId: evaluation ? evaluation._id : null,
        };
      })
    );

    // Filter by status if provided
    let filteredIdeas = ideasWithEvalStatus;
    if (status) {
      filteredIdeas = ideasWithEvalStatus.filter(
        (i) => i.evaluationStatus === status
      );
    }

    res.json({ ideas: filteredIdeas });
  } catch (error) {
    next(error);
  }
};

// Submit evaluation
exports.submitEvaluation = async (req, res, next) => {
  try {
    const { ideaId, scores, comments } = req.body;

    // Validate scores
    const { innovation, feasibility, impact, presentation } = scores;

    if (!innovation || !feasibility || !impact || !presentation) {
      return res.status(400).json({ error: "All score fields are required" });
    }

    if (
      [innovation, feasibility, impact, presentation].some(
        (s) => s < 1 || s > 10
      )
    ) {
      return res.status(400).json({ error: "Scores must be between 1 and 10" });
    }

    // Check if idea exists and is assigned to evaluator
    const idea = await Idea.findById(ideaId);

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    if (!idea.assignedEvaluators.includes(req.user.id)) {
      return res
        .status(403)
        .json({ error: "You are not assigned to evaluate this idea" });
    }

    // Find or create evaluation
    let evaluation = await Evaluation.findOne({
      ideaId,
      evaluatorId: req.user.id,
    });

    if (evaluation && evaluation.status === "completed") {
      return res.status(400).json({ error: "Evaluation already submitted" });
    }

    if (evaluation) {
      // Update existing evaluation
      evaluation.scores = scores;
      evaluation.comments = comments;
      evaluation.submit();
    } else {
      // Create new evaluation
      evaluation = await Evaluation.create({
        ideaId,
        evaluatorId: req.user.id,
        scores,
        comments,
        status: "completed",
        submittedAt: new Date(),
      });
    }

    await evaluation.save();

    // Update idea's average score
    await updateIdeaAverageScore(ideaId);

    // Notify admin
    const admins = await User.find({ roles: "admin" });
    for (const admin of admins) {
      await emailService.sendEvaluationCompletedEmail(
        admin.email,
        req.user.fullName,
        idea.title
      );
    }

    res.json({ message: "Evaluation submitted successfully", evaluation });
  } catch (error) {
    next(error);
  }
};

// Get evaluation by ID
exports.getEvaluationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findById(id)
      .populate("ideaId")
      .populate("evaluatorId", "fullName");

    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    // Check permissions
    const isEvaluator = evaluation.evaluatorId._id.toString() === req.user.id;
    const isFounder = evaluation.ideaId.founderId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    if (!isEvaluator && !isFounder && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this evaluation" });
    }

    res.json({ evaluation });
  } catch (error) {
    next(error);
  }
};

// Update evaluation (before submission)
exports.updateEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scores, comments } = req.body;

    const evaluation = await Evaluation.findOne({
      _id: id,
      evaluatorId: req.user.id,
    });

    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    if (evaluation.status === "completed") {
      return res
        .status(400)
        .json({ error: "Cannot edit submitted evaluation" });
    }

    if (scores) evaluation.scores = scores;
    if (comments) evaluation.comments = comments;

    await evaluation.save();

    res.json({ message: "Evaluation updated successfully", evaluation });
  } catch (error) {
    next(error);
  }
};

// Get evaluations for an idea (admin/founder only)
exports.getIdeaEvaluations = async (req, res, next) => {
  try {
    const { ideaId } = req.params;

    const idea = await Idea.findById(ideaId);

    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    // Check permissions
    const isFounder = idea.founderId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("admin");

    if (!isFounder && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const evaluations = await Evaluation.find({
      ideaId,
      status: "completed",
    }).populate("evaluatorId", "fullName");

    res.json({ evaluations });
  } catch (error) {
    next(error);
  }
};

// Helper function to update idea's average score
// Helper function to update idea's average score
async function updateIdeaAverageScore(ideaId) {
  const evaluations = await Evaluation.find({ 
    ideaId, 
    status: 'completed' 
  });

  if (evaluations.length === 0) {
    return;
  }

  const totalScore = evaluations.reduce((sum, evaluation) => {
    return sum + evaluation.averageScore;
  }, 0);

  const averageScore = totalScore / evaluations.length;

  await Idea.findByIdAndUpdate(ideaId, {
    averageScore,
    evaluationCount: evaluations.length
  });
}


module.exports = exports;
