const Message = require("../models/message.model");
const User = require("../models/user.model");

function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins room with their own userId
    socket.on("join", (userId) => {
      socket.userId = userId;
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
      User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).exec();
    });

    // Handle sending message
    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        // 🔹 RULE: Prevent sending message to yourself
        if (senderId === receiverId) {
          return socket.emit("errorMessage", "You cannot send messages to yourself");
        }

        // 🔹 RULE: Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          return socket.emit("errorMessage", "Receiver not found");
        }

        // Save message in DB
        const message = new Message({ senderId, receiverId, text });
        await message.save();

        // Send to receiver if online
        io.to(receiverId).emit("receiveMessage", message);

        // Also send back to sender (for confirmation)
        io.to(senderId).emit("messageSent", message);

      } catch (err) {
        console.error("SendMessage Error:", err);
        socket.emit("errorMessage", "Failed to send message");
      }
    });

    // User disconnects
    socket.on("disconnect", async () => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
}

module.exports = chatSocket;
