const Message = require("../models/message.model");
const User = require("../models/user.model");

const chatSocketHandler = (io, socket) => {
  // User joins their personal room
  socket.on("join", async (userId) => {
    try {
      socket.userId = userId;
      socket.join(userId);
      console.log(`✅ User ${userId} joined their personal room`);

      // Update online status
      await User.findByIdAndUpdate(userId, { isOnline: true });
      socket.broadcast.emit("userOnline", userId);
    } catch (err) {
      console.error("⚠️ Error updating online status:", err.message);
    }
  });

  // Send message (no follow check, anyone can message)
  socket.on("sendMessage", async ({ senderId, receiverId, message }, callback) => {
    try {
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });

      // Deliver message to receiver
      io.to(receiverId).emit("receiveMessage", newMessage);

      // Confirmation for sender
      if (receiverId !== senderId) {
        socket.emit("receiveMessage", newMessage);
      }

      if (callback) callback({ success: true, message: newMessage });
    } catch (err) {
      console.error("❌ Message DB error:", err.message);
      if (callback) callback({ success: false, error: "Message failed" });
    }
  });

  // Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });

  // Disconnect
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
