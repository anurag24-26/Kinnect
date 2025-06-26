// sockets/index.js
const { Server } = require("socket.io");
const chatSocketHandler = require("./chat.socket");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Update with frontend origin if needed
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // Register all socket event handlers
    chatSocketHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);
    });
  });
};

module.exports = { initSocket };
