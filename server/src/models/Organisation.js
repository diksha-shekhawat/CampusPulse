// ==============================================================================
// Organisation Model (server/src/models/Organisation.js)
// ==============================================================================
// This model represents Student Clubs, Societies, and Departments on campus.
// Per the V1 Technical Blueprint:
// - Organizations are created by the Admin with a unique `organisationId` and temporary password.
// - On first login, `mustChangePassword` is true, forcing the organization to pick a permanent password.
// - Organizations publish Posts, Polls, and Events for students who follow them.

const mongoose = require("mongoose");

const ALLOWED_CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Academic",
  "Social",
  "Other"
];

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Organisation name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    // Unique human-readable ID used for login and public profile URL (e.g., 'acm-club', 'dance-society')
    organisationId: {
      type: String,
      required: [true, "Organisation ID is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Organisation ID can only contain lowercase letters, numbers, and hyphens"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      enum: ALLOWED_CATEGORIES,
      default: "Other"
    },
    // Profile or logo picture URL
    imageUrl: {
      type: String,
      default: ""
    },
    // Encrypted password hash
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"]
    },
    // Blueprint requirement: Forces organization representative to change temporary password on first login
    mustChangePassword: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Strip out passwordHash when returning organisation data to the client
organisationSchema.methods.toJSON = function () {
  const orgObject = this.toObject();
  delete orgObject.passwordHash;
  return orgObject;
};

const Organisation = mongoose.model("Organisation", organisationSchema);

module.exports = Organisation;
