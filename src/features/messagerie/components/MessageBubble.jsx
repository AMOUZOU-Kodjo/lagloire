export default function MessageBubble({ message, isOwn }) {
  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className="rounded-lg px-4 py-3 max-w-sm text-sm italic text-soft bg-sand-2">Message supprimé</div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`rounded-lg px-4 py-3 max-w-sm text-sm ${isOwn ? "bg-ink text-white" : "card"}`}>
        {message.replyTo && (
          <div className={`text-xs mb-1.5 pb-1.5 border-b ${isOwn ? "border-white/20 text-white/70" : "border-line text-soft"}`}>
            ↪ {message.replyTo.sender?.firstName}: {message.replyTo.content?.slice(0, 40)}
          </div>
        )}
        {message.messageType === "TEXTE" && message.content}
        {message.messageType === "IMAGE" && message.mediaUrl && <img src={message.mediaUrl} alt="" className="rounded max-w-full" />}
        {message.messageType === "AUDIO" && message.mediaUrl && <audio controls src={message.mediaUrl} />}
        {message.messageType === "VIDEO" && message.mediaUrl && <video controls src={message.mediaUrl} className="max-w-full rounded" />}
      </div>
    </div>
  );
}
