const Message = require("../models/message.model");
const User = require("../models/User"); // for online/last seen tracking

const chatSocketHandler = (io, socket) => {
  // Join personal room
  socket.on("join", async (userId) => {
    socket.userId = userId;
    socket.join(userId);
    console.log(`✅ User ${userId} joined their personal room`);

    // Mark user online
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
      socket.broadcast.emit("userOnline", userId); // broadcast to others
    } catch (err) {
      console.error("⚠️ Error updating online status:", err.message);
    }
  });

  // Send message
  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });

      // Send to receiver if online
      io.to(receiverId).emit("receiveMessage", newMessage);

      // Confirm to sender
      socket.emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("❌ Message DB error:", err.message);
      socket.emit("error", { message: "Message failed" });
    }
  });

  // Typing indicator (optional)
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });

  // On disconnect, update last seen
  socket.on("disconnect", async () => {
    const userId = socket.userId;
    if (!userId) return;

    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      socket.broadcast.emit("userOffline", userId);
      console.log(`🔌 User ${userId} disconnected`);
    } catch (err) {
      console.error("⚠️ Disconnect update failed:", err.message);
    }
  });
};

module.exports = chatSocketHandler;
