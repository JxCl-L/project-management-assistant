import { useEffect, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getSocket } from "@/lib/socket";

function getCurrentUser() {
  try {
    return Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
  } catch {
    return null;
  }
}

export function useTaskPresence(taskId, projectId) {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  const [roomUsers, setRoomUsers] = useState([]);
  const [fieldEditors, setFieldEditors] = useState({});

  useEffect(() => {
    console.log("🧠 useTaskPresence triggered", { taskId, projectId, user });

    if (!taskId || !user?._id) {
      console.log("⛔ skip: missing taskId or user", {
        taskId,
        userId: user?._id,
      });
      return;
    }

    const socket = getSocket();
    console.log("🔌 socket instance:", socket);

    const onConnect = () => {
      console.log("🟢 socket connected:", socket.id);
    };

    const onConnectError = (err) => {
      console.error("🔴 socket connect error:", err.message);
    };

    const joinRoom = () => {
      console.log("📤 EMIT task:join", {
        taskId,
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      socket.emit("task:join", {
        taskId,
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    };

    const handleConnectedJoin = () => {
      console.log("🟢 connected → now join room");
      joinRoom();
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    if (socket.connected) {
      console.log("✅ socket already connected, joining now");
      joinRoom();
    } else {
      console.log("⏳ socket not connected yet, waiting for connect");
      socket.once("connect", handleConnectedJoin);
    }

    const onPresence = ({ users }) => {
      console.log("📥 RECEIVED task:presence", users);
      // setRoomUsers(users.filter((u) => u.userId !== user._id));
      setRoomUsers(users);
    };

    const onFieldFocus = ({ userId, field }) => {
      console.log("📥 RECEIVED focus", { userId, field });
      if (userId === user._id) return;
      setFieldEditors((prev) => ({ ...prev, [field]: userId }));
    };

    const onFieldBlur = ({ userId, field }) => {
      console.log("📥 RECEIVED blur", { userId, field });
      setFieldEditors((prev) => {
        if (prev[field] !== userId) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };

    const onTaskUpdated = ({ updatedBy }) => {
      if (updatedBy?.userId === user._id) return;
      queryClient.invalidateQueries({
        queryKey: ["fetchTask", projectId, taskId],
      });
    };

    const onContentUpdated = ({ savedBy }) => {
      if (savedBy?.userId === user._id) return;
      queryClient.invalidateQueries({
        queryKey: ["fetchTaskContent", projectId, taskId],
      });
    };

    const onReconnect = () => {
      console.log("🔄 reconnect → rejoin");
      joinRoom();
    };

    socket.on("task:presence", onPresence);
    socket.on("task:field-focus", onFieldFocus);
    socket.on("task:field-blur", onFieldBlur);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:content-updated", onContentUpdated);
    socket.io.on("reconnect", onReconnect);

    return () => {
      console.log("🧹 cleanup → leaving room", { taskId });

      socket.emit("task:leave", { taskId, userId: user._id });

      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("connect", handleConnectedJoin);
      socket.off("task:presence", onPresence);
      socket.off("task:field-focus", onFieldFocus);
      socket.off("task:field-blur", onFieldBlur);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:content-updated", onContentUpdated);
      socket.io.off("reconnect", onReconnect);
    };
  }, [taskId, projectId, queryClient, user?._id, user?.firstName, user?.lastName]);

  const emitFieldFocus = useCallback(
    (field) => {
      if (!taskId || !user?._id) return;
      getSocket().emit("task:field-focus", { taskId, userId: user._id, field });
    },
    [taskId, user?._id],
  );

  const emitFieldBlur = useCallback(
    (field) => {
      if (!taskId || !user?._id) return;
      getSocket().emit("task:field-blur", { taskId, userId: user._id, field });
    },
    [taskId, user?._id],
  );

  return { roomUsers, fieldEditors, emitFieldFocus, emitFieldBlur };
}