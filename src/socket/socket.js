const jwt = require("jsonwebtoken");
const presenceStore = require("./presenceStore.js");

function initSocket(io) {
  // --- Auth middleware ---
  // Frontend must pass the JWT in socket.handshake.auth.token (e.g. "Bearer <token>")
  io.use((socket, next) => {
    const raw = socket.handshake.auth?.token || socket.handshake.query?.token;
    const token = raw?.replace("Bearer ", "");
    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error: invalid token"));
      socket.user = decoded; // { sub: userId, email, iat, exp }
      next();
    });
  });

  // Track which task rooms each socket has joined so we can clean up on disconnect
  // socketRooms: Map<socketId, Set<taskId>>
  const socketRooms = new Map();

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}  user: ${socket.user.sub}`);
    console.log(`🟢 [CONNECT] socket=${socket.id} user=${socket.user.sub}`);
    socketRooms.set(socket.id, new Set());

    // ------------------------------------------------------------------ //
    // task:join
    // ------------------------------------------------------------------ //
    socket.on("task:join", ({ taskId, userId, firstName, lastName }) => {
      const roomName = `task:${taskId}`;
      console.log("📥 [JOIN REQUEST]", {
        socketId: socket.id,
        taskId,
        userId,
        name: `${firstName} ${lastName}`,
      });

      socket.join(roomName);
      socketRooms.get(socket.id)?.add(taskId);

      presenceStore.addSocket(
        taskId,
        userId,
        { userId, firstName, lastName },
        socket.id,
      );
      const users = presenceStore.getUsers(taskId);

      console.log("🏠 [ROOM STATE AFTER JOIN]", {
        roomName,
        users,
      });
      console.log("🧠 ALL ROOMS SNAPSHOT:", presenceStore.store);

      io.to(roomName).emit("task:presence", {
        users,
      });

      console.log("📢 [EMIT presence]", users);

      //   io.to(roomName).emit("task:presence", {
      //     users: presenceStore.getUsers(taskId),
      //   });
    });

    // ------------------------------------------------------------------ //
    // task:leave
    // ------------------------------------------------------------------ //
    socket.on("task:leave", ({ taskId, userId }) => {
      const roomName = `task:${taskId}`;
      console.log("📤 [LEAVE REQUEST]", {
        socketId: socket.id,
        taskId,
        userId,
      });

      socket.leave(roomName);
      socketRooms.get(socket.id)?.delete(taskId);

      presenceStore.removeSocket(taskId, userId, socket.id);

      //   io.to(roomName).emit("task:presence", {
      //     users: presenceStore.getUsers(taskId),
      //   });
      const users = presenceStore.getUsers(taskId);

      console.log("🏠 [ROOM STATE AFTER LEAVE]", {
        roomName,
        users,
      });

      io.to(roomName).emit("task:presence", {
        users,
      });
    });

    // ------------------------------------------------------------------ //
    // task:field-focus — relay to everyone else in the room
    // ------------------------------------------------------------------ //
    socket.on("task:field-focus", ({ taskId, userId, field }) => {
      console.log("✏️ [FOCUS]", { taskId, userId, field });
      socket.to(`task:${taskId}`).emit("task:field-focus", { userId, field });
    });

    // ------------------------------------------------------------------ //
    // task:field-blur — relay to everyone else in the room
    // ------------------------------------------------------------------ //
    socket.on("task:field-blur", ({ taskId, userId, field }) => {
      console.log("🟡 [BLUR]", { taskId, userId, field });
      socket.to(`task:${taskId}`).emit("task:field-blur", { userId, field });
    });

    // ------------------------------------------------------------------ //
    // disconnect — treat as leave for every room the socket was in
    // ------------------------------------------------------------------ //
    socket.on("disconnect", () => {
      console.log(`🔴 [DISCONNECT] socket=${socket.id}`);

      const joinedTasks = socketRooms.get(socket.id);

      if (joinedTasks) {
        for (const taskId of joinedTasks) {
          console.log("🚪 [AUTO LEAVE ON DISCONNECT]", {
            taskId,
            userId: socket.user.sub,
          });

          presenceStore.removeSocket(taskId, socket.user.sub, socket.id);

          const users = presenceStore.getUsers(taskId);

          console.log("🏠 [ROOM AFTER DISCONNECT]", {
            taskId,
            users,
          });

          io.to(`task:${taskId}`).emit("task:presence", {
            users,
          });
        }
      }

      socketRooms.delete(socket.id);
    });
  });
}

module.exports = initSocket;
