const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notification.controller");
const requireAuth = require("../middlewares/auth.middleware");

router.get("/", requireAuth, getNotifications);
router.patch("/:notificationId/read", requireAuth, markAsRead);

module.exports = router;
