import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../../api/chat.api";
import { useAuthStore } from "../../../store/authStore";
import { useSocketStore } from "../../../store/socketStore";
import { Avatar, Input } from "../../../components/ui";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ roomId, otherUser }) {
  const currentUser = useAuthStore((s) => s.user);
  const socket = useSocketStore((s) => s.socket);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const { data: messages } = useQuery({
    queryKey: ["chat-messages", roomId],
    queryFn: () => chatApi.messages(roomId).then((r) => r.data),
    enabled: !!roomId,
  });

  const sendMutation = useMutation({
    mutationFn: (content) => chatApi.send(roomId, { content, messageType: "TEXTE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-messages", roomId] }),
  });

  useEffect(() => {
    if (!socket || !roomId) return undefined;
    socket.emit("chat:join", roomId);
    function handleIncoming() {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", roomId] });
    }
    socket.on("chat:message", handleIncoming);
    return () => {
      socket.emit("chat:leave", roomId);
      socket.off("chat:message", handleIncoming);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate(text);
    setText("");
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-line">
        <Avatar firstName={otherUser?.firstName} lastName={otherUser?.lastName} src={otherUser?.profile?.avatarUrl} />
        <div>
          <p className="font-medium text-sm">{otherUser?.firstName} {otherUser?.lastName}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-sand-2">
        {(messages ?? []).map((m) => (
          <MessageBubble key={m.id} message={m} isOwn={m.senderId === currentUser?.id} />
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 flex items-center gap-2 bg-white border-t border-line">
        <button type="button" className="btn btn-ghost">📎</button>
        <Input className="flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message…" />
        <button className="btn btn-gold" type="submit">Envoyer</button>
      </form>
    </div>
  );
}
