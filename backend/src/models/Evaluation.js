const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    ideaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true,
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scores: {
      innovation: {
        type: Number,
        min: 1,
        max: 10,
        required: function () {
          return this.status === "completed";
        },
      },
      feasibility: {
        type: Number,
        min: 1,
        max: 10,
        required: function () {
          return this.status === "completed";
        },
      },
      impact: {
        type: Number,
        min: 1,
        max: 10,
        required: function () {
          return this.status === "completed";
        },
      },
      presentation: {
        type: Number,
        min: 1,
        max: 10,
        required: function () {
          return this.status === "completed";
        },
      },
    },
    comments: {
      type: String,
      maxlength: [1000, "Comments cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one evaluation per evaluator per idea
evaluationSchema.index({ ideaId: 1, evaluatorId: 1 }, { unique: true });

// Virtual for total score
evaluationSchema.virtual("totalScore").get(function () {
  if (!this.scores) return 0;
  return (
    this.scores.innovation +
    this.scores.feasibility +
    this.scores.impact +
    this.scores.presentation
  );
});

// Virtual for average score
evaluationSchema.virtual("averageScore").get(function () {
  return this.totalScore / 4;
});

// Method to submit evaluation
evaluationSchema.methods.submit = function () {
  this.status = "completed";
  this.submittedAt = new Date();
};

// Ensure virtuals are included in JSON
evaluationSchema.set("toJSON", { virtuals: true });
evaluationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Evaluation", evaluationSchema);
