import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { chatApi } from "../../../api/chat.api";
import { useAuthStore } from "../../../store/authStore";
import { Input, EmptyState, Button, RoleBadge } from "../../../components/ui";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

export default function MessageriePage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  // La même page sert l'espace membre (/app) et le back-office (/admin)
  const basePath = location.pathname.startsWith("/admin") ? "/admin/messagerie" : "/app/messagerie";
  const [search, setSearch] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [starting, setStarting] = useState(false);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.myConversations().then((r) => r.data),
  });

  const { data: contacts } = useQuery({
    queryKey: ["chat-contacts"],
    queryFn: () => chatApi.contacts().then((r) => r.data),
    enabled: showContacts,
  });

  const filtered = (conversations ?? []).filter((c) => {
    const other = c.participants?.find((p) => p.userId !== currentUser?.id)?.user;
    const name = `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const filteredContacts = useMemo(
    () =>
      (contacts ?? []).filter((u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
      ),
    [contacts, search]
  );

  const startConversation = async (userId) => {
    setStarting(true);
    try {
      const res = await chatApi.startOrGet(userId);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setShowContacts(false);
      navigate(`${basePath}/${res.data.id}`);
    } finally {
      setStarting(false);
    }
  };

  const activeConversation = conversations?.find((c) => c.id === roomId);
  const otherUser = activeConversation?.participants?.find((p) => p.userId !== currentUser?.id)?.user;

  return (
    <div className="flex bg-white rounded-lg overflow-hidden border border-line" style={{ height: "calc(100vh - 160px)" }}>
      <div className="w-80 flex-shrink-0 border-r border-line flex flex-col">
        <div className="p-5 border-b border-line">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl">Messagerie</p>
            <button
              type="button"
              onClick={() => setShowContacts((v) => !v)}
              title="Nouvelle discussion"
              className="w-8 h-8 rounded-lg bg-gold text-white flex items-center justify-center hover:opacity-90 transition"
            >
              {showContacts ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>
          <Input className="mt-3 text-sm" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {showContacts ? (
          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-[11px] font-mono uppercase tracking-wide text-soft px-3 py-2">
              Démarrer une discussion
            </p>
            {(filteredContacts ?? []).length === 0 ? (
              <p className="text-xs text-soft px-3 py-4">Aucun membre trouvé.</p>
            ) : (
              filteredContacts.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  disabled={starting}
                  onClick={() => startConversation(u.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sand-1 transition text-left disabled:opacity-50"
                >
                  <span className="w-9 h-9 rounded-full bg-sand-2 border border-line flex items-center justify-center text-xs font-bold text-ink flex-shrink-0">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">{u.firstName} {u.lastName}</span>
                    <RoleBadge role={u.role} className="scale-90 origin-left" />
                  </span>
                </button>
              ))
            )}
          </div>
        ) : !isLoading && filtered.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <EmptyState icon="💬" title="Aucune conversation" description="Cliquez sur + pour écrire à un membre de l'église." />
          </div>
        ) : (
          <ConversationList conversations={filtered} activeRoomId={roomId} onSelect={(id) => navigate(`${basePath}/${id}`)} />
        )}
      </div>

      {!showContacts && (roomId && activeConversation ? (
        <ChatWindow roomId={roomId} otherUser={otherUser} />
      ) : (
        <div className="flex-1 hidden sm:flex items-center justify-center">
          <EmptyState icon="💬" title="Sélectionnez une conversation" />
        </div>
      ))}
    </div>
  );
}
