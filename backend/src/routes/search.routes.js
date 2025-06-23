const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth.middleware");
const User = require("../models/user.model");
const Post = require("../models/post.model");

router.get("/:query", requireAuth, async (req, res) => {
  const searchTerm = req.params.query;

  try {
    const users = await User.find({
      username: { $regex: searchTerm, $options: "i" },
    }).select("_id username");

    const posts = await Post.find({
      content: { $regex: searchTerm, $options: "i" },
    }).populate("user", "username");

    res.status(200).json({ users, posts });
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

module.exports = router;
