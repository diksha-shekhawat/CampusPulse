// ==============================================================================
// Post Model (server/src/models/Post.js)
// ==============================================================================
// This model represents all content published by Organizations on Campus Pulse.
// Per the V1 Technical Blueprint:
// - A post has one of 3 types: 'normal', 'poll', or 'event'.
// - 'normal' post has an image and a caption.
// - 'poll' post has a question and multiple choice options.
// - 'event' post is embedded with event-specific fields (title, venue, startAt, endAt).
// - Only Organisations publish posts. Students consume and interact with them.

const mongoose = require("mongoose");

// Subdocument schema for Poll Options
const pollOptionSchema = new mongoose.Schema(
  {
    optionId: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: [true, "Poll option text is required"],
      trim: true
    }
  },
  { _id: false } // No separate _id needed for subdocument options
);

// Subdocument schema for Poll Data
const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Poll question is required"],
      trim: true
    },
    options: {
      type: [pollOptionSchema],
      validate: {
        validator: function (options) {
          return options && options.length >= 2;
        },
        message: "A poll must have at least 2 options"
      }
    }
  },
  { _id: false }
);

// Subdocument schema for Event Data
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true
    },
    venue: {
      type: String,
      required: [true, "Event venue/location is required"],
      trim: true
    },
    startAt: {
      type: Date,
      required: [true, "Event start date and time is required"]
    },
    endAt: {
      type: Date,
      required: [true, "Event end date and time is required"],
      validate: {
        validator: function (endAt) {
          // Event end time must be after the start time
          return !this.startAt || endAt > this.startAt;
        },
        message: "Event end time must be after start time"
      }
    },
    isCancelled: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

// Main Post Schema
const postSchema = new mongoose.Schema(
  {
    // References the Organisation that created this post
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organisation",
      required: [true, "Organisation reference is required"],
      index: true
    },
    type: {
      type: String,
      enum: ["normal", "poll", "event"],
      required: [true, "Post type is required"]
    },
    // Caption for normal post or description for poll/event
    caption: {
      type: String,
      trim: true,
      default: ""
    },
    // Image URL for normal post picture or event banner
    imageUrl: {
      type: String,
      default: ""
    },
    // Embedded Poll details (present if type === 'poll')
    poll: {
      type: pollSchema,
      required: function () {
        return this.type === "poll";
      }
    },
    // Embedded Event details (present if type === 'event')
    event: {
      type: eventSchema,
      required: function () {
        return this.type === "event";
      }
    },
    // Admin or Org moderation status ('published' or 'hidden')
    status: {
      type: String,
      enum: ["published", "hidden"],
      default: "published"
    }
  },
  {
    timestamps: true
  }
);

// Composite Index for fast feed queries (fetch latest posts first)
postSchema.index({ createdAt: -1 });
postSchema.index({ organisationId: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
