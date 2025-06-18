const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["like", "comment", "follow"], required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
