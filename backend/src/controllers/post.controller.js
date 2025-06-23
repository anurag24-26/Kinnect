const Post = require("../models/post.model");
const cloudinary = require("../config/cloudinary");

exports.createPost = async (req, res) => {
  try {
    const { text, tags } = req.body;
    const userId = req.user.id;

    const imageLinks = [];
    console.log("📥 req.body:", req.body);
    console.log("📸 req.files:", req.files);
    console.log("👤 req.user:", req.user);
    if (req.files && req.files.length > 0) {
      for (const file of req.files.slice(0, 3)) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "kinnect/posts",
        });
        imageLinks.push(result.secure_url);
      }
    }

    const post = await Post.create({
      user: userId,
      text,
      tags,
      images: imageLinks,
    });

    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Post creation failed", error: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;

    const posts = await Post.find({ user: userId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user's posts", error: err.message });
  }
};
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: err.message });
  }
};
// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized or Post not found" });
    }

    post.text = req.body.text || post.text;
    await post.save();

    res.json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update post", error: error.message });
  }
};
// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized or Post not found" });
    }

    await post.remove();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete post", error: error.message });
  }
};
