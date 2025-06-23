const Follow = require("../models/follow.model");
const User = require("../models/user.model");

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const follower = req.user.id;
    const following = req.params.id;

    if (!follower || !following) {
      return res
        .status(400)
        .json({ message: "Invalid follower or following ID." });
    }

    if (follower === following) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    const alreadyFollowing = await Follow.findOne({ follower, following });
    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user." });
    }

    await Follow.create({ follower, following });

    res.status(200).json({ message: "Followed successfully." });
  } catch (err) {
    console.error("❌ Error in followUser:", err.message);
    res.status(500).json({ message: "Follow failed", error: err.message });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const follower = req.user.id;
    const following = req.params.id;

    if (!follower || !following) {
      return res
        .status(400)
        .json({ message: "Invalid follower or following ID." });
    }

    const result = await Follow.findOneAndDelete({ follower, following });
    if (!result) {
      return res
        .status(400)
        .json({ message: "You are not following this user." });
    }

    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (err) {
    console.error("❌ Error in unfollowUser:", err.message);
    res.status(500).json({ message: "Unfollow failed", error: err.message });
  }
};

// Get stats: followers and following of a user
exports.getFollowStats = async (req, res) => {
  const userId = req.params.id;

  try {
    const followers = await Follow.find({ following: userId }).populate(
      "follower",
      "username _id avatar"
    );
    const following = await Follow.find({ follower: userId }).populate(
      "following",
      "username _id avatar"
    );

    res.status(200).json({
      followers: followers.map((f) => f.follower),
      following: following.map((f) => f.following),
    });
  } catch (error) {
    console.error("❌ Error in getFollowStats:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch follow stats", error: error.message });
  }
};
