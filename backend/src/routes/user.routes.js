
const express = require("express");
const router = express.Router();

const requireAuth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  getUserProfile,
  getCurrentUser,
  updateProfile,
  updateAvatar,
  getSuggestions,
  updatePassword,
  
} = require("../controllers/user.controller");

// 🔹 Current user
router.get("/me", requireAuth, getCurrentUser);

// 🔹 Profile update
router.put("/update", requireAuth, updateProfile);
router.put("/update-avatar", requireAuth, upload.single("avatar"), updateAvatar);
router.put("/update-password", requireAuth, updatePassword);

// 🔹 Suggestions
router.get("/suggestions", requireAuth, getSuggestions);

// // 🔹 Delete account
// router.delete("/delete", requireAuth, deleteAccount);

// 🔹 Public profile
router.get("/:id", requireAuth, getUserProfile);

module.exports = router;

