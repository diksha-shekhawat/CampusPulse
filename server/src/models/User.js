// ==============================================================================
// User Model (server/src/models/User.js)
// ==============================================================================
// This model represents Student and Admin accounts in Campus Pulse.
// Per the V1 Technical Blueprint:
// - Students register with their official college email (@jklu.edu.in).
// - Admin accounts manage organizations and platform moderation.
// - Password hashes are stored (never plaintext passwords).

const mongoose = require("mongoose");

// Allowed courses for students at the university
const ALLOWED_COURSES = ["BTech", "BBA", "BDes", "MDes", "MBA", "MTech", "PhD"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      // Custom validation for college email format
      validate: {
        validator: function (value) {
          // Admin can have any valid email; Students MUST have @jklu.edu.in email
          if (this.role === "admin") {
            return /^\S+@\S+\.\S+$/.test(value);
          }
          return value.endsWith("@jklu.edu.in");
        },
        message: "Students must use their official college email ending with @jklu.edu.in"
      }
    },
    // The password is encrypted with bcrypt before being saved
    passwordHash: {
      type: String,
      required: [true, "Password is required"]
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    // Academic details (required for students)
    course: {
      type: String,
      enum: ALLOWED_COURSES,
      required: function () {
        return this.role === "student";
      }
    },
    enrollmentYear: {
      type: Number,
      required: function () {
        return this.role === "student";
      }
    },
    passingOutYear: {
      type: Number,
      required: function () {
        return this.role === "student";
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    // Automatically creates `createdAt` and `updatedAt` fields
    timestamps: true
  }
);

// Viva Concept: We hide the passwordHash by default when converting user to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
