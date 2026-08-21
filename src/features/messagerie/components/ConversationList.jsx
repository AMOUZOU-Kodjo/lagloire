import { Avatar, Badge } from "../../../components/ui";
import { formatRelative, truncate } from "../../../lib/formatters";
import { useAuthStore } from "../../../store/authStore";

export default function ConversationList({ conversations, activeRoomId, onSelect }) {
  const currentUser = useAuthStore((s) => s.user);

  return (
    <div className="overflow-y-auto">
      {conversations.map((conv) => {
        const other = conv.participants?.find((p) => p.userId !== currentUser?.id)?.user;
        const lastMessage = conv.messages?.[0];
        const isActive = conv.id === activeRoomId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex items-center gap-3 px-5 py-4 text-left ${isActive ? "bg-sand-2 border-l-4 border-gold" : "hover:bg-gray-50"}`}
          >
            <Avatar firstName={other?.firstName} lastName={other?.lastName} src={other?.profile?.avatarUrl} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <p className="text-sm font-semibold truncate">{other?.firstName} {other?.lastName}</p>
                {lastMessage && <span className="text-xs text-soft flex-shrink-0">{formatRelative(lastMessage.createdAt)}</span>}
              </div>
              <p className="text-xs truncate text-soft">
                {lastMessage
                  ? lastMessage.messageType === "TEXTE" ? truncate(lastMessage.content, 40) : `📎 ${lastMessage.messageType}`
                  : "Nouvelle conversation"}
              </p>
            </div>
            {conv.unreadCount > 0 && <Badge tone="gold">{conv.unreadCount}</Badge>}
          </button>
        );
      })}
    </div>
  );
}
