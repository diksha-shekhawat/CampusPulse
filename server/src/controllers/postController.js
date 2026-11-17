// ==============================================================================
// Post Controller (server/src/controllers/postController.js)
// ==============================================================================
// Handles content creation and management by Student Organisations.
// Per the V1 Technical Blueprint:
// - Only organisations publish posts (students do not publish).
// - Supports 3 distinct post types:
//   1. Normal (Photo + Caption)
//   2. Poll (Question + Options)
//   3. Event (Title, Venue, Start/End Timestamps)
// - Strictly enforces ownership checks on deletion (Club A cannot delete Club B's posts).

const { Post, PollVote, EventRegistration } = require("../models");

/**
 * Create a new Post (Normal, Poll, or Event).
 * @route POST /api/posts
 * @access Private (Organisation only)
 */
const createPost = async (req, res, next) => {
  try {
    const { type, caption, imageUrl, poll, event } = req.body;

    // 1. Validate post type
    if (!type || !["normal", "poll", "event"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post type. Must be 'normal', 'poll', or 'event'."
      });
    }

    const postData = {
      organisationId: req.user._id,
      type,
      caption: caption ? caption.trim() : "",
      imageUrl: imageUrl ? imageUrl.trim() : ""
    };

    // 2. Type-specific validations
    if (type === "normal") {
      if (!postData.caption && !postData.imageUrl) {
        return res.status(400).json({
          success: false,
          message: "A normal announcement must have at least a caption or an image."
        });
      }
    } else if (type === "poll") {
      if (!poll || !poll.question || !poll.question.trim()) {
        return res.status(400).json({
          success: false,
          message: "Poll must have a question."
        });
      }

      if (!poll.options || !Array.isArray(poll.options) || poll.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "A poll must have at least 2 options."
        });
      }

      // Format options with sequential IDs and trimmed text
      const formattedOptions = poll.options
        .map((opt, index) => ({
          optionId: index + 1,
          text: typeof opt === "string" ? opt.trim() : (opt.text || "").trim()
        }))
        .filter((opt) => opt.text.length > 0);

      if (formattedOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Please enter valid text for at least 2 poll options."
        });
      }

      postData.poll = {
        question: poll.question.trim(),
        options: formattedOptions
      };
    } else if (type === "event") {
      if (!event || !event.title || !event.venue || !event.startAt || !event.endAt) {
        return res.status(400).json({
          success: false,
          message: "Event requires title, venue, startAt date/time, and endAt date/time."
        });
      }

      const start = new Date(event.startAt);
      const end = new Date(event.endAt);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format for event start or end time."
        });
      }

      // Viva Concept: Validate chronological order of event timestamps
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: "Event end time must be after the start time."
        });
      }

      postData.event = {
        title: event.title.trim(),
        venue: event.venue.trim(),
        startAt: start,
        endAt: end,
        isCancelled: false
      };
    }

    // 3. Save post in MongoDB
    const newPost = await Post.create(postData);

    // Populate organisation details for response
    await newPost.populate("organisationId", "name organisationId imageUrl category");

    res.status(201).json({
      success: true,
      message: `${type.toUpperCase()} post published successfully!`,
      data: newPost
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all posts published by the currently logged-in Organisation.
 * @route GET /api/posts/my-posts
 * @access Private (Organisation only)
 */
const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ organisationId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("organisationId", "name organisationId imageUrl category");

    // Fetch vote counts for polls and registration counts for events
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();

        if (post.type === "poll") {
          const totalVotes = await PollVote.countDocuments({ postId: post._id });
          postObj.totalVotes = totalVotes;
        } else if (post.type === "event") {
          const totalRegistrations = await EventRegistration.countDocuments({ postId: post._id });
          postObj.totalRegistrations = totalRegistrations;
        }

        return postObj;
      })
    );

    res.status(200).json({
      success: true,
      count: postsWithCounts.length,
      data: postsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a post (with strict ownership check).
 * @route DELETE /api/posts/:id
 * @access Private (Organisation owner or Admin)
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    // Viva Concept: Server-side ownership verification
    // Organisation can ONLY delete their own posts; Admin can delete any post.
    const isOwner = post.organisationId.toString() === req.user._id.toString();
    const isAdmin = req.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete another organisation's post."
      });
    }

    // Delete post and any associated votes / registrations
    await Post.findByIdAndDelete(post._id);
    await PollVote.deleteMany({ postId: post._id });
    await EventRegistration.deleteMany({ postId: post._id });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getMyPosts,
  deletePost
};
