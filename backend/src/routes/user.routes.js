// At the top with other imports
const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth.middleware");
const {
  getUserProfile,
  updateProfile,
  getCurrentUser,
} = require("../controllers/user.controller");

// Your existing routes
router.get("/:id", requireAuth, getUserProfile);
router.put("/update", requireAuth, updateProfile);

// 🔥 Add this new route
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
