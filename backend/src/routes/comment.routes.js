const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByPost,
} = require("../controllers/comment.controller");
const requireAuth = require("../middlewares/auth.middleware");
router.post("/", requireAuth, addComment);
router.get("/:postId", requireAuth, getCommentsByPost);

module.exports = router;
