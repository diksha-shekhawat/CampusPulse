// ==============================================================================
// Poll Vote Model (server/src/models/PollVote.js)
// ==============================================================================
// This model records votes cast by students on Poll Posts.
// Per the V1 Technical Blueprint:
// - Keeps vote counts accurate and auditable.
// - Unique compound index on { studentId, postId } guarantees exactly one vote per student.

const mongoose = require("mongoose");

const pollVoteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      index: true
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post reference is required"],
      index: true
    },
    // The optionId selected by the student (e.g. 1, 2, 3)
    optionId: {
      type: Number,
      required: [true, "Option ID is required"]
    }
  },
  {
    timestamps: true
  }
);

// Viva Concept: Enforces the rule that a student can only vote ONCE per poll at the database level
pollVoteSchema.index({ studentId: 1, postId: 1 }, { unique: true });

const PollVote = mongoose.model("PollVote", pollVoteSchema);

module.exports = PollVote;
