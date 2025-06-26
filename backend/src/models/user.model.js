const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  lastSeen: {
    type: Date,
    default: null,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
