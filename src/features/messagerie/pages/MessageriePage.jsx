import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "../../../api/chat.api";
import { useAuthStore } from "../../../store/authStore";
import { Input, EmptyState } from "../../../components/ui";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

export default function MessageriePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.myConversations().then((r) => r.data),
  });

  const filtered = (conversations ?? []).filter((c) => {
    const other = c.participants?.find((p) => p.userId !== currentUser?.id)?.user;
    const name = `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const activeConversation = conversations?.find((c) => c.id === roomId);
  const otherUser = activeConversation?.participants?.find((p) => p.userId !== currentUser?.id)?.user;

  return (
    <div className="flex bg-white rounded-lg overflow-hidden border border-line" style={{ height: "calc(100vh - 160px)" }}>
      <div className="w-80 flex-shrink-0 border-r border-line flex flex-col">
        <div className="p-5 border-b border-line">
          <p className="font-display text-xl">Messagerie</p>
          <Input className="mt-3 text-sm" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {!isLoading && filtered.length === 0 ? (
          <EmptyState icon="💬" title="Aucune conversation" description="Écrivez à un responsable depuis son profil pour démarrer une discussion." />
        ) : (
          <ConversationList conversations={filtered} activeRoomId={roomId} onSelect={(id) => navigate(`/app/messagerie/${id}`)} />
        )}
      </div>

      {roomId && activeConversation ? (
        <ChatWindow roomId={roomId} otherUser={otherUser} />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon="💬" title="Sélectionnez une conversation" />
        </div>
      )}
    </div>
  );
}
