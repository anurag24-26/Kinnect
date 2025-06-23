const Like = require("../models/like.model");
const Post = require("../models/post.model");

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ liked: false, message: "Post unliked" });
    } else {
      await Like.create({ user: userId, post: postId });
      return res.status(201).json({ liked: true, message: "Post liked" });
    }
  } catch (err) {
    console.error("❌ Like toggle error:", err);
    res
      .status(500)
      .json({ message: "Failed to toggle like", error: err.message });
  }
};

exports.getLikesCount = async (req, res) => {
  try {
    const postId = req.params.postId;
    const count = await Like.countDocuments({ post: postId });
    res.status(200).json({ count });
  } catch (err) {
    console.error("❌ Get likes count error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch like count", error: err.message });
  }
};

exports.hasLiked = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const like = await Like.findOne({ user: userId, post: postId });
    res.status(200).json({ liked: !!like });
  } catch (err) {
    console.error("❌ Has liked check error:", err);
    res
      .status(500)
      .json({ message: "Failed to check like", error: err.message });
  }
};
