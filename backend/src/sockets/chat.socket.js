module.exports = (io, socket) => {
  socket.on("joinChat", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 User joined room: ${roomId}`);
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", {
      message,
      sender: socket.id,
      timestamp: Date.now(),
    });
  });
};
