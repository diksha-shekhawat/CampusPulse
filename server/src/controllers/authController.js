// ==============================================================================
// Authentication Controller (server/src/controllers/authController.js)
// ==============================================================================
// Handles registration, login, session checks, and logout for all three user roles:
// 1. Student
// 2. Organisation
// 3. Admin

const bcrypt = require("bcryptjs");
const { User, Organisation } = require("../models");
const { sendTokenResponse, clearTokenResponse } = require("../utils/token");

// ------------------------------------------------------------------------------
// Student Authentication
// ------------------------------------------------------------------------------

/**
 * Register a new Student account.
 * @route POST /api/auth/student/register
 */
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, course, enrollmentYear, passingOutYear } = req.body;

    // 1. Basic validation of input fields
    if (!name || !email || !password || !course || !enrollmentYear || !passingOutYear) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password, course, enrollmentYear, passingOutYear."
      });
    }

    // 2. Ensure email has @jklu.edu.in domain
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.endsWith("@jklu.edu.in")) {
      return res.status(400).json({
        success: false,
        message: "Registration is restricted to college email addresses ending with @jklu.edu.in."
      });
    }

    // 3. Password minimum length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
    }

    // 4. Check if student already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this college email already exists. Please log in."
      });
    }

    // 5. Hash the password with bcrypt (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Create student document
    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "student",
      course,
      enrollmentYear: Number(enrollmentYear),
      passingOutYear: Number(passingOutYear),
      emailVerifiedAt: new Date() // Mark verified
    });

    // 7. Generate JWT token and return httpOnly cookie
    sendTokenResponse(student, "student", 201, res, "Student registered successfully!");
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing Student.
 * @route POST /api/auth/student/login
 */
const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both college email and password."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find student by email
    const student = await User.findOne({ email: normalizedEmail, role: "student" });
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid college email or password."
      });
    }

    // Verify password against stored bcrypt hash
    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid college email or password."
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your student account is inactive. Please contact administration."
      });
    }

    sendTokenResponse(student, "student", 200, res, "Student logged in successfully!");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------------------
// Organisation Authentication
// ------------------------------------------------------------------------------

/**
 * Log in an Organisation representative.
 * @route POST /api/auth/organisation/login
 */
const loginOrganisation = async (req, res, next) => {
  try {
    const { organisationId, password } = req.body;

    if (!organisationId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both Organisation ID and password."
      });
    }

    const normalizedId = organisationId.toLowerCase().trim();

    // Find organisation by organisationId
    const org = await Organisation.findOne({ organisationId: normalizedId });
    if (!org) {
      return res.status(401).json({
        success: false,
        message: "Invalid Organisation ID or password."
      });
    }

    // Verify password against stored bcrypt hash
    const isMatch = await bcrypt.compare(password, org.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Organisation ID or password."
      });
    }

    if (!org.isActive) {
      return res.status(403).json({
        success: false,
        message: "This organisation account has been deactivated."
      });
    }

    sendTokenResponse(org, "organisation", 200, res, "Organisation logged in successfully!");
  } catch (error) {
    next(error);
  }
};

/**
 * Change Organisation password (mandatory on first login).
 * @route POST /api/auth/organisation/change-password
 */
const changeOrganisationPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long."
      });
    }

    // req.user is attached by protect middleware
    const org = await Organisation.findById(req.user._id);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found."
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, org.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    org.passwordHash = await bcrypt.hash(newPassword, salt);
    // Mark first-login requirement as completed
    org.mustChangePassword = false;

    await org.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully! You can now access your dashboard.",
      data: org
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------------------
// Admin Authentication
// ------------------------------------------------------------------------------

/**
 * Log in an Admin user.
 * @route POST /api/auth/admin/login
 */
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both admin email and password."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find admin user
    const admin = await User.findOne({ email: normalizedEmail, role: "admin" });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials."
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials."
      });
    }

    sendTokenResponse(admin, "admin", 200, res, "Admin logged in successfully!");
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------------------------------------
// Current Session & Logout
// ------------------------------------------------------------------------------

/**
 * Get current authenticated user session from cookie.
 * @route GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    role: req.role,
    data: req.user
  });
};

/**
 * Log out and clear the session cookie.
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  clearTokenResponse(res, "Logged out successfully.");
};

module.exports = {
  registerStudent,
  loginStudent,
  loginOrganisation,
  changeOrganisationPassword,
  loginAdmin,
  getMe,
  logout
};
