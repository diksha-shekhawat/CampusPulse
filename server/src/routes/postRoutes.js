// ==============================================================================
// Post Routes (server/src/routes/postRoutes.js)
// ==============================================================================
// Defines endpoints for feeds, post creation, voting, and event registrations.

const express = require("express");
const router = express.Router();

const {
  createPost,
  getFeed,
  votePoll,
  registerEvent,
  getUpcomingEvents,
  getMyPosts,
  deletePost
} = require("../controllers/postController");

const { protect, authorize } = require("../middleware/auth");

// Helper for public/optional auth (so logged-in students get personalized vote/RSVP status)
const optionalAuth = async (req, res, next) => {
  if ((req.cookies && req.cookies.token) || req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

// ------------------------------------------------------------------------------
// Feed & Public Interaction Routes
// ------------------------------------------------------------------------------

// Student Feed (supports ?tab=following and ?tab=discover)
router.get("/feed", optionalAuth, getFeed);

// Today & Tomorrow Upcoming Events Spotlight
router.get("/upcoming-events", optionalAuth, getUpcomingEvents);

// ------------------------------------------------------------------------------
// Student Action Routes
// ------------------------------------------------------------------------------

// Cast a vote on a poll (Student only)
router.post("/:id/vote", protect, authorize("student"), votePoll);

// RSVP / Register for an event (Student only)
router.post("/:id/register", protect, authorize("student"), registerEvent);

// ------------------------------------------------------------------------------
// Organisation Content Management Routes
// ------------------------------------------------------------------------------

// Create a new post (Organisation only)
router.post("/", protect, authorize("organisation"), createPost);

// Get all posts published by the logged-in organisation
router.get("/my-posts", protect, authorize("organisation"), getMyPosts);

// Delete a post (Organisation owner or Admin)
router.delete("/:id", protect, authorize("organisation", "admin"), deletePost);

module.exports = router;
