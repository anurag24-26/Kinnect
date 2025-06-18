const Notification = require("../models/notification.model");

exports.createNotification = async ({
  type,
  sender,
  receiver,
  post = null,
}) => {
  if (sender.toString() === receiver.toString()) return;
  await Notification.create({ type, sender, receiver, post });
};
