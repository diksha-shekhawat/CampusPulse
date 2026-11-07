// ==============================================================================
// Event Registration Model (server/src/models/EventRegistration.js)
// ==============================================================================
// This model records student RSVPs / registrations for campus events.
// Per the V1 Technical Blueprint:
// - Stores which students registered for which event post.
// - Unique compound index ensures a student cannot register for the same event multiple times.

const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
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
      required: [true, "Event post reference is required"],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Viva Concept: Enforces that a student can only register once per event at the database level
eventRegistrationSchema.index({ studentId: 1, postId: 1 }, { unique: true });

const EventRegistration = mongoose.model("EventRegistration", eventRegistrationSchema);

module.exports = EventRegistration;
