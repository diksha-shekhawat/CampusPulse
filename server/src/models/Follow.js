// ==============================================================================
// Follow Relationship Model (server/src/models/Follow.js)
// ==============================================================================
// This model tracks which Organisations a Student is following.
// Per the V1 Technical Blueprint:
// - Powers the 'Following' tab in the Student Feed.
// - A unique compound index prevents a student from following the same club twice.

const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      index: true
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: [true, "Organisation reference is required"],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Viva Concept: Unique compound index ensures a student cannot follow the same org more than once
followSchema.index({ studentId: 1, organisationId: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;
