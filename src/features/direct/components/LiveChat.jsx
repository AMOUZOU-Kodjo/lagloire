import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSocketStore } from "../../../store/socketStore";
import { useAuthStore } from "../../../store/authStore";
import { Input, Button } from "../../../components/ui";

export default function LiveChat({ roomId }) {
  const socket = useSocketStore((s) => s.socket);
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId) return undefined;
    setMessages([]);
    socket.emit("chat:join", roomId);

    function handleMessage(payload) {
      setMessages((prev) => [...prev.slice(-200), payload]);
    }
    socket.on("chat:message", handleMessage);

    return () => {
      socket.emit("chat:leave", roomId);
      socket.off("chat:message", handleMessage);
    };
  }, [socket, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    const payload = { roomId, conversationId: roomId, content: text.trim(), sender: user };
    // Écho local : le serveur relaie seulement aux autres participants
    setMessages((prev) => [...prev, payload]);
    socket.emit("chat:message", payload);
    setText("");
  }

  if (!user) {
    return (
      <div className="card rounded-lg p-6 text-sm text-soft-dark lg:sticky lg:top-6">
        <p className="font-semibold text-ink mb-2">Discussion en direct</p>
        <p className="mb-4">Connectez-vous pour participer au chat du culte.</p>
        <Button as={Link} to="/connexion" variant="gold" size="sm">Se connecter</Button>
      </div>
    );
  }

  return (
    <div className="card rounded-lg flex flex-col h-[560px] lg:sticky lg:top-6">
      <div className="p-4 border-b border-line flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Discussion en direct</p>
        <span className="flex items-center gap-1.5 text-xs text-palm">
          <span className="w-1.5 h-1.5 rounded-full bg-palm animate-pulse" /> En ligne
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-slim">
        {messages.length === 0 && (
          <p className="text-xs text-soft-dark">Soyez le premier à écrire dans le direct 🙌</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-xs ${m.sender?.id === user.id ? "text-right" : ""}`}>
            {m.sender?.id !== user.id && (
              <span className="font-semibold text-gold">{m.sender?.firstName ?? "Anonyme"}</span>
            )}
            {m.sender?.id !== user.id && " "}
            <span
              className={`inline-block max-w-[85%] px-2.5 py-1.5 rounded-lg ${
                m.sender?.id === user.id ? "bg-gold/15 text-ink" : "bg-sand text-soft-dark"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 flex gap-2 border-t border-line">
        <Input className="flex-1 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message…" maxLength={500} />
        <button className="btn btn-gold" type="submit">↑</button>
      </form>
    </div>
  );
}
