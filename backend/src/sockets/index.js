const socketIO = require("socket.io");
const registerChatHandlers = require("./chat.socket");
const registerNotificationHandlers = require("./notification.socket");

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // Adjust to frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔗 New socket connected:", socket.id);

    registerChatHandlers(io, socket);
    registerNotificationHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
};

module.exports = { initSocket, getIO: () => io };
