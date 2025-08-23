const express = require("express");
const router = express.Router();

const requireAuth = require("../middlewares/auth.middleware");
const {
  getUserProfile,
  updateProfile,
  getCurrentUser,
  updateAvatar,
  getSuggestions
} = require("../controllers/user.controller");

const upload = require("../middlewares/upload.middleware");


router.get("/me", requireAuth, getCurrentUser);
router.put("/update", requireAuth, updateProfile);
router.put("/update-avatar", requireAuth, upload.single("avatar"), updateAvatar);
router.get("/suggestions",  requireAuth, getSuggestions);


router.get("/:id", requireAuth, getUserProfile);

module.exports = router;
