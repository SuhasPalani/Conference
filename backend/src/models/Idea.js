const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  abstract: {
    type: String,
    required: [true, 'Abstract is required'],
    maxlength: [500, 'Abstract cannot exceed 500 characters']
  },
  problem: {
    type: String,
    required: [true, 'Problem statement is required'],
    maxlength: [1000, 'Problem statement cannot exceed 1000 characters']
  },
  solution: {
    type: String,
    required: [true, 'Solution is required'],
    maxlength: [1000, 'Solution cannot exceed 1000 characters']
  },
  team: {
    type: String,
    required: [true, 'Team information is required'],
    maxlength: [500, 'Team information cannot exceed 500 characters']
  },
  pitchDeck: {
    type: String, // File path
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  submittedAt: {
    type: Date,
    default: null
  },
  assignedEvaluators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  averageScore: {
    type: Number,
    default: null
  },
  evaluationCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
ideaSchema.index({ founderId: 1, status: 1 });
ideaSchema.index({ assignedEvaluators: 1 });

// Method to check if idea can be edited
ideaSchema.methods.canBeEdited = function() {
  return this.status === 'draft';
};

// Method to check if idea can be deleted
ideaSchema.methods.canBeDeleted = function() {
  return this.status === 'draft';
};

// Method to submit idea
ideaSchema.methods.submit = function() {
  if (this.status === 'draft') {
    this.status = 'submitted';
    this.submittedAt = new Date();
  }
};

module.exports = mongoose.model('Idea', ideaSchema);