const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // Avatar fields
    avatar: { type: String, default: "" },            // Cloudinary secure_url
    avatarPublicId: { type: String, default: "" },     // Cloudinary public_id (for deletion)

    bio: { type: String, default: "" },

    lastSeen: { type: Date, default: null },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Never return password in toJSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
