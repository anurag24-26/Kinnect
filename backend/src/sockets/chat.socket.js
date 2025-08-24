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

  // Send message
  socket.on("sendMessage", async ({ senderId, receiverId, message, type }, callback) => {
    try {
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
        type: type || "text",
        status: "sent",
      });

      // Deliver to receiver
      io.to(receiverId).emit("receiveMessage", newMessage);

      // Deliver back to sender (confirmation)
      if (receiverId !== senderId) {
        socket.emit("receiveMessage", newMessage);
      }

      if (callback) callback({ success: true, message: newMessage });
    } catch (err) {
      console.error("❌ Message DB error:", err.message);
      if (callback) callback({ success: false, error: "Message failed" });
    }
  });

  // Delivered (receiver’s socket confirms receipt)
  socket.on("messageDelivered", async ({ messageId }) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        messageId,
        { status: "delivered" },
        { new: true }
      );
      if (updated) {
        io.to(updated.senderId).emit("messageStatusUpdate", {
          messageId,
          status: "delivered",
        });
      }
    } catch (err) {
      console.error("⚠️ messageDelivered error:", err.message);
    }
  });

  // Read (when receiver opens chat)
  socket.on("messageRead", async ({ messageId }) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        messageId,
        { status: "read" },
        { new: true }
      );
      if (updated) {
        io.to(updated.senderId).emit("messageStatusUpdate", {
          messageId,
          status: "read",
        });
      }
    } catch (err) {
      console.error("⚠️ messageRead error:", err.message);
    }
  });

  // Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });

  // Disconnect → set offline + last seen
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
