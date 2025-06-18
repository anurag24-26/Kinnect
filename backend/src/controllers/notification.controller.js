const Notification = require("../models/notification.model");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ receiver: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ notifications });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch notifications", error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update notification", error: err.message });
  }
};
