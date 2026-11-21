// ==============================================================================
// Post Interaction Model (server/src/models/PostInteraction.js)
// ==============================================================================
// Tracks student likes and bookmark saves for posts.
// Per the V1 Technical Blueprint:
// - Fields: _id, studentId, postId, type, createdAt
// - type is either 'like' or 'save'
// - Unique compound index on { studentId, postId, type } guarantees idempotency.

const mongoose = require("mongoose");

const postInteractionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["like", "save"],
      required: [true, "Interaction type is required ('like' or 'save')"]
    }
  },
  {
    timestamps: true
  }
);

// Viva Concept: Unique compound index ensures duplicate likes or saves are rejected at the database level
postInteractionSchema.index({ studentId: 1, postId: 1, type: 1 }, { unique: true });

const PostInteraction = mongoose.model("PostInteraction", postInteractionSchema);

module.exports = PostInteraction;
