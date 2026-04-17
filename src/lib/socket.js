import { io } from "socket.io-client";
import Cookies from "js-cookie";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

// Lazily-created singleton — null until the first getSocket() call.
let socket = null;

/**
 * Returns the single shared Socket.io instance, creating it on first call.
 * Subsequent calls return the same object — no new connections are opened.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // Auth callback is invoked on every (re)connect, so the token is always
      // read fresh from cookies rather than captured at module-load time.
      auth: (cb) => {
        const token = Cookies.get("token");
        cb({ token: token ? `Bearer ${token}` : "" });
      },
      // Don't auto-connect at module load; let useTaskPresence drive the
      // lifecycle by emitting task:join / task:leave explicitly.
      autoConnect: true,
    });
  }
  return socket;
}
