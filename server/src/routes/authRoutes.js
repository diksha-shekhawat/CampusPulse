// ==============================================================================
// Authentication Routes (server/src/routes/authRoutes.js)
// ==============================================================================
// Defines all auth-related endpoints per Section 5 of the V1 Blueprint.

const express = require("express");
const router = express.Router();

const {
  registerStudent,
  loginStudent,
  loginOrganisation,
  changeOrganisationPassword,
  loginAdmin,
  getMe,
  logout
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/auth");

// ------------------------------------------------------------------------------
// Public Routes
// ------------------------------------------------------------------------------

// Student Registration & Login
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);

// Organisation Login
router.post("/organisation/login", loginOrganisation);

// Admin Login
router.post("/admin/login", loginAdmin);

// Logout (clears cookie)
router.post("/logout", logout);

// ------------------------------------------------------------------------------
// Protected Routes
// ------------------------------------------------------------------------------

// Get current session info (requires valid cookie)
router.get("/me", protect, getMe);

// Organisation password change (first-login requirement)
router.post(
  "/organisation/change-password",
  protect,
  authorize("organisation"),
  changeOrganisationPassword
);

module.exports = router;
