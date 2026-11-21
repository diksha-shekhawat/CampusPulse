// ==============================================================================
// Organisation Routes (server/src/routes/organisationRoutes.js)
// ==============================================================================
// Defines endpoints for viewing organizations and student follow/unfollow actions.

const express = require("express");
const router = express.Router();

const {
  getOrganisations,
  followOrganisation,
  unfollowOrganisation
} = require("../controllers/organisationController");

const { protect, authorize } = require("../middleware/auth");

// Optional auth helper: if token cookie exists, populates req.user; otherwise continues as guest
const optionalAuth = async (req, res, next) => {
  if ((req.cookies && req.cookies.token) || req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

// ------------------------------------------------------------------------------
// Organisation Routes
// ------------------------------------------------------------------------------

// Get all active organisations (with follow status if logged in)
router.get("/", optionalAuth, getOrganisations);

// Follow an organisation (Student only)
router.post("/:id/follow", protect, authorize("student"), followOrganisation);

// Unfollow an organisation (Student only)
router.delete("/:id/follow", protect, authorize("student"), unfollowOrganisation);

module.exports = router;
