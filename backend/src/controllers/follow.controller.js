const Follow = require("../models/follow.model");

exports.followUser = async (req, res) => {
  try {
    const follower = req.user.id;
    const following = req.params.id;

    if (follower === following) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const existing = await Follow.findOne({ follower, following });
    if (existing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    await Follow.create({ follower, following });
    res.status(200).json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Follow failed", error: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const follower = req.user.id;
    const following = req.params.id;

    const result = await Follow.findOneAndDelete({ follower, following });
    if (!result) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Unfollow failed", error: err.message });
  }
};

exports.getFollowStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    res
      .status(200)
      .json({ followers: followersCount, following: followingCount });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch stats", error: err.message });
  }
};
