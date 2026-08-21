import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Home, User, MessageSquare, CalendarDays, Sunrise, Gift, BookUser, Image, Menu } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = MEMBER_LINKS.map((l) =>
    l.to === "/app/messagerie" ? { ...l, count: unreadCount || undefined } : l
  );

  return (
    <div className="flex min-h-screen bg-sand">
      <Sidebar links={links} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <main className="flex-1 min-w-0">
        <header className="flex items-center gap-3 justify-between px-4 md:px-8 py-4 md:py-5 bg-white border-b border-line">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-ink hover:bg-sand-2 transition"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-mono text-soft uppercase hidden sm:block">{formatDate(new Date(), "EEEE d MMMM yyyy")}</p>
              <h1 className="font-display text-xl md:text-2xl truncate">Bonjour, {user?.firstName ?? "membre"} 👋</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-ink flex-shrink-0">
            <NotificationBell />
            {user?.role && <RoleBadge role={user.role} className="hidden sm:inline-block" />}
            <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.profile?.avatarUrl} />
          </div>
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
