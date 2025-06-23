const Comment = require("../models/comment.model");
const Post = require("../models/post.model.js");

// Add a new comment to a post
exports.addComment = async (req, res) => {
  const { postId, text } = req.body;

  if (!text || !postId) {
    return res.status(400).json({ message: "Text and postId are required." });
  }

  try {
    const comment = new Comment({
      post: postId,
      user: req.user.id,
      text,
    });

    await comment.save();

    // Optional: Add comment ID to the post's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    const populatedComment = await comment.populate("user", "username avatar");
    res.status(201).json(populatedComment);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add comment", error: err.message });
  }
};

// Get all comments for a post
exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get comments", error: err.message });
  }
};
