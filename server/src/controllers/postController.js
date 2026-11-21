// ==============================================================================
// Post Controller (server/src/controllers/postController.js)
// ==============================================================================
// Handles content creation, feeds, and student interactions.
// Per the V1 Technical Blueprint:
// - Only organisations publish posts (students do not publish).
// - Supports 3 post types: Normal (Photo+Caption), Poll, and Event.
// - Dual Student Feed: 'Following' (followed clubs only) and 'Discover' (all clubs).
// - Poll Voting: Strictly 1 vote per student per poll.
// - Event RSVP: Strictly 1 registration per student per event.
// - Upcoming Events: Spotlight section for events starting Today or Tomorrow (Asia/Kolkata).

const { Post, PollVote, EventRegistration, Follow, PostInteraction } = require("../models");

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

    const newPost = await Post.create(postData);
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
 * Get the Student Feed with 'following' or 'discover' tabs.
 * @route GET /api/posts/feed?tab=discover (or ?tab=following)
 * @access Public / Authenticated
 */
const getFeed = async (req, res, next) => {
  try {
    const tab = req.query.tab || "discover"; // 'following', 'discover', or 'saved'
    let filter = { status: "published" };

    // If 'following' tab is requested by a logged-in student
    if (tab === "following") {
      if (!req.user || req.role !== "student") {
        return res.status(401).json({
          success: false,
          message: "Please log in as a student to view your Following feed."
        });
      }

      // Find all organisations followed by this student
      const follows = await Follow.find({ studentId: req.user._id });
      const followedOrgIds = follows.map((f) => f.organisationId);

      // Only show posts from followed organisations
      filter.organisationId = { $in: followedOrgIds };
    } else if (tab === "saved") {
      if (!req.user || req.role !== "student") {
        return res.status(401).json({
          success: false,
          message: "Please log in as a student to view your Saved posts."
        });
      }

      // Find all posts bookmarked by this student
      const saves = await PostInteraction.find({
        studentId: req.user._id,
        type: "save"
      }).sort({ createdAt: -1 });

      const savedPostIds = saves.map((s) => s.postId);
      filter._id = { $in: savedPostIds };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("organisationId", "name organisationId imageUrl category");

    // Format posts with live vote percentages, likes, bookmarks, and student interaction state
    const studentId = req.user && req.role === "student" ? req.user._id : null;

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const postObj = post.toObject();

        // 1. Post Likes count and status
        const likesCount = await PostInteraction.countDocuments({
          postId: post._id,
          type: "like"
        });
        postObj.likesCount = likesCount;

        let isLiked = false;
        let isSaved = false;
        if (studentId) {
          const userLike = await PostInteraction.findOne({
            studentId,
            postId: post._id,
            type: "like"
          });
          isLiked = !!userLike;

          const userSave = await PostInteraction.findOne({
            studentId,
            postId: post._id,
            type: "save"
          });
          isSaved = !!userSave;
        }
        postObj.isLiked = isLiked;
        postObj.isSaved = isSaved;

        // 2. Poll-specific data
        if (post.type === "poll") {
          // Total votes
          const totalVotes = await PollVote.countDocuments({ postId: post._id });
          postObj.totalVotes = totalVotes;

          // Check if current student has voted on this poll
          let userVotedOptionId = null;
          if (studentId) {
            const userVote = await PollVote.findOne({ studentId, postId: post._id });
            if (userVote) userVotedOptionId = userVote.optionId;
          }
          postObj.userVotedOptionId = userVotedOptionId;

          // Calculate vote count and percentage for each option
          const optionsWithPercentages = await Promise.all(
            post.poll.options.map(async (opt) => {
              const optionVotes = await PollVote.countDocuments({
                postId: post._id,
                optionId: opt.optionId
              });
              const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
              return {
                optionId: opt.optionId,
                text: opt.text,
                votes: optionVotes,
                percentage
              };
            })
          );
          postObj.poll.options = optionsWithPercentages;
        } else if (post.type === "event") {
          // Total RSVPs
          const totalRegistrations = await EventRegistration.countDocuments({ postId: post._id });
          postObj.totalRegistrations = totalRegistrations;

          // Check if current student has registered
          let isRegistered = false;
          if (studentId) {
            const registration = await EventRegistration.findOne({ studentId, postId: post._id });
            isRegistered = !!registration;
          }
          postObj.isRegistered = isRegistered;
        }

        return postObj;
      })
    );

    res.status(200).json({
      success: true,
      tab,
      count: formattedPosts.length,
      data: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cast a vote on a Poll post.
 * @route POST /api/posts/:id/vote
 * @access Private (Student only)
 */
const votePoll = async (req, res, next) => {
  try {
    const { optionId } = req.body;
    const postId = req.params.id;

    if (!optionId) {
      return res.status(400).json({
        success: false,
        message: "Please select an option to vote."
      });
    }

    const post = await Post.findById(postId);
    if (!post || post.type !== "poll") {
      return res.status(404).json({
        success: false,
        message: "Poll not found."
      });
    }

    // Check if valid option
    const validOption = post.poll.options.find((opt) => opt.optionId === Number(optionId));
    if (!validOption) {
      return res.status(400).json({
        success: false,
        message: "Invalid option selected."
      });
    }

    // Check if student already voted (Unique Compound Index protection)
    const existingVote = await PollVote.findOne({
      studentId: req.user._id,
      postId: post._id
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this poll. Multiple votes are not permitted."
      });
    }

    await PollVote.create({
      studentId: req.user._id,
      postId: post._id,
      optionId: Number(optionId)
    });

    res.status(200).json({
      success: true,
      message: "Vote cast successfully!"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register / RSVP for an Event post.
 * @route POST /api/posts/:id/register
 * @access Private (Student only)
 */
const registerEvent = async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post || post.type !== "event") {
      return res.status(404).json({
        success: false,
        message: "Event post not found."
      });
    }

    // Check if event has already finished
    if (new Date(post.event.endAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This event has already ended."
      });
    }

    const existingRegistration = await EventRegistration.findOne({
      studentId: req.user._id,
      postId: post._id
    });

    if (existingRegistration) {
      // Toggle / Cancel registration if clicked again
      await EventRegistration.findByIdAndDelete(existingRegistration._id);
      return res.status(200).json({
        success: true,
        isRegistered: false,
        message: "Registration cancelled."
      });
    }

    // Register student
    await EventRegistration.create({
      studentId: req.user._id,
      postId: post._id
    });

    res.status(200).json({
      success: true,
      isRegistered: true,
      message: `Successfully registered for ${post.event.title}!`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Upcoming Events (Today and Tomorrow spotlight).
 * @route GET /api/posts/upcoming-events
 * @access Public / Authenticated
 */
const getUpcomingEvents = async (req, res, next) => {
  try {
    const now = new Date();

    // Find all active event posts that haven't finished yet
    const events = await Post.find({
      type: "event",
      status: "published",
      "event.endAt": { $gte: now }
    })
      .sort({ "event.startAt": 1 })
      .populate("organisationId", "name organisationId imageUrl category");

    // Format with student registration status
    const studentId = req.user && req.role === "student" ? req.user._id : null;

    const formattedEvents = await Promise.all(
      events.map(async (post) => {
        const postObj = post.toObject();
        const totalRegistrations = await EventRegistration.countDocuments({ postId: post._id });
        postObj.totalRegistrations = totalRegistrations;

        let isRegistered = false;
        if (studentId) {
          const reg = await EventRegistration.findOne({ studentId, postId: post._id });
          isRegistered = !!reg;
        }
        postObj.isRegistered = isRegistered;

        // Classify as Today or Tomorrow using campus timezone
        const start = new Date(post.event.startAt);
        const diffDays = Math.floor((start - now) / (1000 * 60 * 60 * 24));
        postObj.dayLabel = diffDays <= 0 ? "TODAY" : diffDays === 1 ? "TOMORROW" : "UPCOMING";

        return postObj;
      })
    );

    res.status(200).json({
      success: true,
      count: formattedEvents.length,
      data: formattedEvents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all posts published by the logged-in Organisation.
 * @route GET /api/posts/my-posts
 * @access Private (Organisation only)
 */
const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ organisationId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("organisationId", "name organisationId imageUrl category");

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

    const isOwner = post.organisationId.toString() === req.user._id.toString();
    const isAdmin = req.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete another organisation's post."
      });
    }

    await Post.findByIdAndDelete(post._id);
    await PollVote.deleteMany({ postId: post._id });
    await EventRegistration.deleteMany({ postId: post._id });
    await PostInteraction.deleteMany({ postId: post._id });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Like on a Post (Idempotent).
 * @route POST /api/posts/:id/like
 * @access Private (Student only)
 */
const toggleLikePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    const existingLike = await PostInteraction.findOne({
      studentId: req.user._id,
      postId: post._id,
      type: "like"
    });

    let isLiked = false;
    let message = "";

    if (existingLike) {
      // Toggle off / remove like
      await PostInteraction.findByIdAndDelete(existingLike._id);
      isLiked = false;
      message = "Unliked post.";
    } else {
      // Create like (compound index ensures no duplicates)
      await PostInteraction.create({
        studentId: req.user._id,
        postId: post._id,
        type: "like"
      });
      isLiked = true;
      message = "Liked post!";
    }

    const likesCount = await PostInteraction.countDocuments({
      postId: post._id,
      type: "like"
    });

    res.status(200).json({
      success: true,
      isLiked,
      likesCount,
      message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicitly remove Like from a Post.
 * @route DELETE /api/posts/:id/like
 * @access Private (Student only)
 */
const removeLikePost = async (req, res, next) => {
  try {
    const postId = req.params.id;

    await PostInteraction.findOneAndDelete({
      studentId: req.user._id,
      postId,
      type: "like"
    });

    const likesCount = await PostInteraction.countDocuments({
      postId,
      type: "like"
    });

    res.status(200).json({
      success: true,
      isLiked: false,
      likesCount,
      message: "Like removed."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Save / Bookmark on a Post (Idempotent).
 * @route POST /api/posts/:id/save
 * @access Private (Student only)
 */
const toggleSavePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found."
      });
    }

    const existingSave = await PostInteraction.findOne({
      studentId: req.user._id,
      postId: post._id,
      type: "save"
    });

    let isSaved = false;
    let message = "";

    if (existingSave) {
      // Toggle off / unsave
      await PostInteraction.findByIdAndDelete(existingSave._id);
      isSaved = false;
      message = "Removed from saved posts.";
    } else {
      // Create bookmark
      await PostInteraction.create({
        studentId: req.user._id,
        postId: post._id,
        type: "save"
      });
      isSaved = true;
      message = "Post saved to your bookmarks!";
    }

    res.status(200).json({
      success: true,
      isSaved,
      message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicitly remove Save / Bookmark from a Post.
 * @route DELETE /api/posts/:id/save
 * @access Private (Student only)
 */
const removeSavePost = async (req, res, next) => {
  try {
    const postId = req.params.id;

    await PostInteraction.findOneAndDelete({
      studentId: req.user._id,
      postId,
      type: "save"
    });

    res.status(200).json({
      success: true,
      isSaved: false,
      message: "Bookmark removed."
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Saved / Bookmarked Posts for current student.
 * @route GET /api/posts/saved
 * @access Private (Student only)
 */
const getSavedPosts = async (req, res, next) => {
  req.query.tab = "saved";
  return getFeed(req, res, next);
};

module.exports = {
  createPost,
  getFeed,
  votePoll,
  registerEvent,
  getUpcomingEvents,
  getMyPosts,
  deletePost,
  toggleLikePost,
  removeLikePost,
  toggleSavePost,
  removeSavePost,
  getSavedPosts
};
