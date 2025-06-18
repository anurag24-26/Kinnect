const express = require("express");
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowStats, // Optional
} = require("../controllers/follow.controller");
const requireAuth = require("../middlewares/auth.middleware");

// Follow a user
router.post("/:id/follow", requireAuth, followUser);

// Unfollow a user
router.post("/:id/unfollow", requireAuth, unfollowUser);

// Get follower/following stats for a user (optional)

router.get("/:id/stats", requireAuth, getFollowStats);

module.exports = router;
