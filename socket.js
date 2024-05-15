// socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const userSockets = new Map();
function init(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  //validate socket user
  io.use((socket, next) => {
    // console.log("socket");
    const token = socket.handshake.query.token;
    // console.log("token ", token);
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log("error ");
          return next(new Error("Authentication error"));
        }
        console.log("not error");
        socket.userId = decoded.id;
        userSockets.set(decoded.id, socket);
        return next();
      });
    } else {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.userId);
    socket.on("disconnect", () => {
      userSockets.delete(socket.userId);
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

module.exports = { init, getIO, userSockets };
