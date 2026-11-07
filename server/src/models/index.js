// ==============================================================================
// Models Central Export (server/src/models/index.js)
// ==============================================================================
// Allows importing any model cleanly, e.g.:
// const { User, Organisation, Post } = require("../models");

const User = require("./User");
const Organisation = require("./Organisation");
const Post = require("./Post");
const Follow = require("./Follow");
const PollVote = require("./PollVote");
const EventRegistration = require("./EventRegistration");

module.exports = {
  User,
  Organisation,
  Post,
  Follow,
  PollVote,
  EventRegistration
};
