import { Outlet } from "react-router-dom";
import { Home, User, MessageSquare, CalendarDays, Sunrise, Gift, BookUser, Image } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../../store/authStore";
import { useNotificationsStore } from "../../store/notificationsStore";
import { RoleBadge } from "../ui/Badge";
import Avatar from "../ui/Avatar";
import { formatDate } from "../../lib/formatters";
import NotificationBell from "../../features/notifications/components/NotificationBell";

const MEMBER_LINKS = [
  { to: "/app", label: "Tableau de bord", icon: Home, end: true },
  { to: "/app/profil", label: "Mon profil", icon: User },
  { to: "/app/messagerie", label: "Messagerie", icon: MessageSquare },
  { to: "/evenements", label: "Événements", icon: CalendarDays },
  { to: "/prieres-matinales", label: "Prières matinales", icon: Sunrise },
  { to: "/app/dons", label: "Mes dons", icon: Gift },
  { to: "/eglises", label: "Annuaire", icon: BookUser },
  { to: "/galerie", label: "Galerie", icon: Image },
];

export default function AppShellLayout() {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const links = MEMBER_LINKS.map((l) =>
    l.to === "/app/messagerie" ? { ...l, count: unreadCount || undefined } : l
  );

  return (
    <div className="flex min-h-screen bg-sand">
      <Sidebar links={links} />
      <main className="flex-1">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-line">
          <div>
            <p className="text-xs font-mono text-soft uppercase">{formatDate(new Date(), "EEEE d MMMM yyyy")}</p>
            <h1 className="font-display text-2xl">Bonjour, {user?.firstName ?? "membre"} 👋</h1>
          </div>
          <div className="flex items-center gap-3 text-ink">
            <NotificationBell />
            {user?.role && <RoleBadge role={user.role} />}
            <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.profile?.avatarUrl} />
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}