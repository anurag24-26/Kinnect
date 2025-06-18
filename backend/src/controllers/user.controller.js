const User = require("../models/user.model");

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
exports.getCurrentUser = async (req, res) => {
  res.status(200).json(req.user); // send plain user object
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
