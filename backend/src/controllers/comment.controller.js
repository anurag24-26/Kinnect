const Comment = require("../models/comment.model");

exports.addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const userId = req.user.id;

    const comment = await Comment.create({ post: postId, user: userId, text });
    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ message: "Failed to comment", error: err.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId }).populate(
      "user",
      "username"
    );
    res.status(200).json(comments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get comments", error: err.message });
  }
};
