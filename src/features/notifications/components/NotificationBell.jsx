import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { notificationsApi } from "../../../api/notifications.api";
import { useNotificationsStore } from "../../../store/notificationsStore";
import { queryKeys } from "../../../lib/queryKeys";
import { Badge } from "../../../components/ui";
import { formatRelative } from "../../../lib/formatters";
import { useMutationFeedback } from "../../../hooks/useMutationFeedback";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const { data } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () =>
      notificationsApi.list({ limit: 10 }).then((res) => {
        setNotifications(res.data, res.unreadCount);
        return res.data;
      }),
  });

  const markAllReadMutation = useMutationFeedback({
    mutationFn: () => notificationsApi.markAllRead(),
    invalidate: [queryKeys.notifications.all],
    successMessage: "Toutes les notifications sont marquées comme lues.",
    onSuccess: () => markAllRead(),
  });

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 text-soft hover:text-ink">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brick text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card rounded-lg overflow-hidden z-50 text-ink">
          <div className="flex items-center justify-between p-4 border-b border-line">
            <p className="font-semibold text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={() => markAllReadMutation.mutate()} className="text-xs text-gold-dim">Tout marquer comme lu</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(data ?? []).length === 0 && <p className="text-xs text-soft p-4">Aucune notification.</p>}
            {(data ?? []).map((n) => (
              <div key={n.id} className={`p-4 text-sm border-b border-line ${!n.isRead ? "bg-sand-2" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{n.title}</p>
                  {!n.isRead && <Badge tone="gold">Nouveau</Badge>}
                </div>
                <p className="text-xs text-soft mt-1">{n.content}</p>
                <p className="text-xs text-soft mt-1">{formatRelative(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
