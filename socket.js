// socket.js
const { Server } = require("socket.io");
let io;

function init(httpServer) {
  io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = { init, getIO };
