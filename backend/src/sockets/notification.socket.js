module.exports = (io, socket) => {
  socket.on("sendNotification", ({ toUserId, payload }) => {
    // Use socket.rooms or user-specific rooms if authenticated
    io.emit(`notification:${toUserId}`, payload);
  });
};
