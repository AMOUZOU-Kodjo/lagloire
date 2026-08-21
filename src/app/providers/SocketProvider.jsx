import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../../store/authStore";
import { useSocketStore } from "../../store/socketStore";
import { useNotificationsStore } from "../../store/notificationsStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function SocketProvider({ children }) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSocket = useSocketStore((s) => s.setSocket);
  const setConnected = useSocketStore((s) => s.setConnected);
  const pushRealtime = useNotificationsStore((s) => s.pushRealtime);

  useEffect(() => {
    if (!user || !accessToken) return undefined;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token: accessToken },
    });
    setSocket(socket);

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", user.id);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("notification", (notification) => {
      pushRealtime(notification);
    });

    return () => {
      socket.emit("leave", user.id);
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, accessToken]);

  return children;
}
