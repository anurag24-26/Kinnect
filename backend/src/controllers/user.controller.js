const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");

// GET /api/users/:id
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};
// GET /api/users/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user (to know who they already follow)
    const currentUser = await User.findById(userId).select("following");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude self + already-following users
    const excludeIds = [...currentUser.following, userId];

    // Find other users, sorted by newest, limit to 10
    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select("username avatar bio")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suggestions", error: err.message });
  }
};

// GET /api/users/me
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch current user", error: err.message });
  }
};

// PUT /api/users/update (NOT avatar — just basic fields)
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["username", "email", "bio"]; // whitelist
    const updates = {};

    for (const key of allowed) {
      if (typeof req.body[key] !== "undefined") updates[key] = req.body[key];
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const userId = req.user.id;
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    // handle duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(409).json({ message: `${field} already in use` });
    }
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// PUT /api/users/update-avatar (avatar ONLY)
exports.updateAvatar = async (req, res) => {
  try {
    // Multer memory storage gives us buffer
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    const user = await User.findById(req.user.id).select("avatarPublicId");
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user already has an avatar, delete old one
    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (e) {
        // non-fatal
        console.warn("Cloudinary delete error:", e.message);
      }
    }

    // Upload new avatar (from buffer via upload_stream)
    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            resource_type: "image",
            transformation: [{ width: 512, height: 512, crop: "limit" }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url, avatarPublicId: result.public_id },
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar updated successfully",
      user: updated,
      avatar: updated.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: "Avatar update failed", error: error.message });
  }
};
