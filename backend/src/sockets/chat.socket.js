// sockets/chat.socket.js
const Message = require("../models/message.model");

const chatSocketHandler = (io, socket) => {
  // Join personal room (based on userId)
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their chat room`);
  });

  // Send Message
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, message } = data;

    try {
      // Save message to DB
      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
      });

      // Emit to receiver's room
      io.to(receiverId).emit("receiveMessage", newMessage);

      // Emit to sender (to confirm or update)
      socket.emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Optional: Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });
};

module.exports = chatSocketHandler;
