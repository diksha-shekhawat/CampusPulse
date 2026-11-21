// ==============================================================================
// Organisation Controller (server/src/controllers/organisationController.js)
// ==============================================================================
// Handles viewing organisations and student follow/unfollow interactions.
// Per the V1 Technical Blueprint:
// - Students can browse active campus clubs and follow/unfollow them.
// - Follow records power the student's personalized 'Following' feed tab.

const { Organisation, Follow } = require("../models");

/**
 * Get all active organisations with follower counts and current student follow status.
 * @route GET /api/organisations
 * @access Public / Authenticated
 */
const getOrganisations = async (req, res, next) => {
  try {
    const organisations = await Organisation.find({ isActive: true })
      .select("-passwordHash")
      .sort({ name: 1 });

    // If a student is logged in, check which clubs they follow
    let followedOrgIds = new Set();
    if (req.user && req.role === "student") {
      const follows = await Follow.find({ studentId: req.user._id });
      followedOrgIds = new Set(follows.map((f) => f.organisationId.toString()));
    }

    // Attach follower count and isFollowing status for each organisation
    const orgsWithDetails = await Promise.all(
      organisations.map(async (org) => {
        const followerCount = await Follow.countDocuments({ organisationId: org._id });
        const orgObj = org.toObject();
        orgObj.followersCount = followerCount;
        orgObj.isFollowing = followedOrgIds.has(org._id.toString());
        return orgObj;
      })
    );

    res.status(200).json({
      success: true,
      count: orgsWithDetails.length,
      data: orgsWithDetails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Follow an organisation.
 * @route POST /api/organisations/:id/follow
 * @access Private (Student only)
 */
const followOrganisation = async (req, res, next) => {
  try {
    const organisationId = req.params.id;

    // Verify organisation exists and is active
    const org = await Organisation.findById(organisationId);
    if (!org || !org.isActive) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found or inactive."
      });
    }

    // Create follow relationship (unique index handles duplicate prevention)
    const existingFollow = await Follow.findOne({
      studentId: req.user._id,
      organisationId: org._id
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "You are already following this organisation."
      });
    }

    await Follow.create({
      studentId: req.user._id,
      organisationId: org._id
    });

    res.status(200).json({
      success: true,
      message: `You are now following ${org.name}!`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unfollow an organisation.
 * @route DELETE /api/organisations/:id/follow
 * @access Private (Student only)
 */
const unfollowOrganisation = async (req, res, next) => {
  try {
    const organisationId = req.params.id;

    const follow = await Follow.findOneAndDelete({
      studentId: req.user._id,
      organisationId
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: "You were not following this organisation."
      });
    }

    res.status(200).json({
      success: true,
      message: "Unfollowed successfully."
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganisations,
  followOrganisation,
  unfollowOrganisation
};
