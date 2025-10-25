const Idea = require('../models/Idea');
const Evaluation = require('../models/Evaluation');
const emailService = require('../services/emailService');

// Create/Update idea (save draft)
exports.saveIdea = async (req, res, next) => {
  try {
    const { title, abstract, problem, solution, team } = req.body;
    const { id } = req.params;

    let idea;

    if (id) {
      // Update existing idea
      idea = await Idea.findOne({ _id: id, founderId: req.user.id });

      if (!idea) {
        return res.status(404).json({ error: 'Idea not found' });
      }

      if (!idea.canBeEdited()) {
        return res.status(400).json({ error: 'Cannot edit submitted ideas' });
      }

      idea.title = title || idea.title;
      idea.abstract = abstract || idea.abstract;
      idea.problem = problem || idea.problem;
      idea.solution = solution || idea.solution;
      idea.team = team || idea.team;

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
        status: 'draft'
      });
    }

    res.json({ 
      message: id ? 'Idea updated successfully' : 'Idea created successfully', 
      idea 
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
      return res.status(404).json({ error: 'Idea not found' });
    }

    if (idea.status !== 'draft') {
      return res.status(400).json({ error: 'Idea has already been submitted' });
    }

    // Validate all required fields
    if (!idea.title || !idea.abstract || !idea.problem || !idea.solution || !idea.team) {
      return res.status(400).json({ error: 'Please complete all required fields' });
    }

    idea.submit();
    await idea.save();

    // Send confirmation email
    await emailService.sendIdeaSubmittedEmail(
      req.user.email,
      req.user.fullName,
      idea.title
    );

    res.json({ message: 'Idea submitted successfully', idea });
  } catch (error) {
    next(error);
  }
};

// Get my ideas (founder)
exports.getMyIdeas = async (req, res, next) => {
  try {
    const ideas = await Idea.find({ founderId: req.user.id })
      .sort({ createdAt: -1 });

    // Get evaluation counts
    const ideasWithStats = await Promise.all(ideas.map(async (idea) => {
      const evaluationCount = await Evaluation.countDocuments({ 
        ideaId: idea._id, 
        status: 'completed' 
      });

      return {
        ...idea.toObject(),
        evaluationCount
      };
    }));

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
      .populate('founderId', 'fullName email')
      .populate('assignedEvaluators', 'fullName email');

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Check permissions
    const isFounder = idea.founderId._id.toString() === req.user.id;
    const isAssignedEvaluator = idea.assignedEvaluators.some(
      e => e._id.toString() === req.user.id
    );
    const isAdmin = req.user.roles.includes('admin');

    if (!isFounder && !isAssignedEvaluator && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this idea' });
    }

    // Get evaluations if founder or admin
    let evaluations = [];
    if (isFounder || isAdmin) {
      evaluations = await Evaluation.find({ ideaId: id, status: 'completed' })
        .populate('evaluatorId', 'fullName')
        .select('-evaluatorId.email'); // Redact evaluator email for privacy
    }

    res.json({ idea, evaluations });
  } catch (error) {
    next(error);
  }
};

// Delete idea (only drafts)
exports.deleteIdea = async (req, res, next) => {
  try {
    const { id } = req.params;

    const idea = await Idea.findOne({ _id: id, founderId: req.user.id });

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    if (!idea.canBeDeleted()) {
      return res.status(400).json({ error: 'Cannot delete submitted ideas' });
    }

    await Idea.findByIdAndDelete(id);

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Upload pitch deck
exports.uploadPitchDeck = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const idea = await Idea.findOne({ _id: id, founderId: req.user.id });

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    if (!idea.canBeEdited()) {
      return res.status(400).json({ error: 'Cannot update submitted ideas' });
    }

    idea.pitchDeck = req.file.path;
    await idea.save();

    res.json({ 
      message: 'Pitch deck uploaded successfully', 
      filePath: req.file.path 
    });
  } catch (error) {
    next(error);
  }
};