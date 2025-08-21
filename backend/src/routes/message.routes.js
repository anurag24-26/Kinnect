const express = require("express");
const router = express.Router();
const Message = require("../models/message.model");
const User = require("../models/user.model");

// Fetch chat between two users
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

router.get("/:id/status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("isOnline lastSeen");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ isOnline: user.isOnline, lastSeen: user.lastSeen });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
