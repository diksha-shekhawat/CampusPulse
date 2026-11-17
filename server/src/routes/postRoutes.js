// ==============================================================================
// Post Routes (server/src/routes/postRoutes.js)
// ==============================================================================
// Defines endpoints for creating, retrieving, and managing organisation posts.

const express = require("express");
const router = express.Router();

const {
  createPost,
  getMyPosts,
  deletePost
} = require("../controllers/postController");

const { protect, authorize } = require("../middleware/auth");

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
