const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth.middleware");
const {
  toggleLike,
  getLikesCount,
  hasLiked,
} = require("../controllers/like.controller");

router.post("/:postId/toggle", requireAuth, toggleLike); // Like or unlike
router.get("/:postId/count", requireAuth, getLikesCount); // Get total likes
router.get("/:postId/status", requireAuth, hasLiked); // Check if user has liked

module.exports = router;
