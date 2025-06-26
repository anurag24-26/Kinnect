// src/sockets/index.js

const { Server } = require("socket.io");
const registerChatHandlers = require("./chat.socket");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // match your frontend
      methods: ["GET", "POST"],
    },
  });

  registerChatHandlers(io);
}

module.exports = { initSocket };
