const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth.middleware");
const {
  followUser,
  unfollowUser,
  getFollowStats,
} = require("../controllers/follow.controller");

// POST /api/follows/:id/follow -> Follow a user
router.post("/:id/follow", requireAuth, followUser);

// POST /api/follows/:id/unfollow -> Unfollow a user
router.post("/:id/unfollow", requireAuth, unfollowUser);

// GET /api/follows/:id/stats -> Get followers and following list
router.get("/:id/stats", requireAuth, getFollowStats);

module.exports = router;
