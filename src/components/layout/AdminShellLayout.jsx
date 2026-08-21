import { useState } from "react";
import { Outlet } from "react-router-dom";
import { BarChart3, UsersRound, Users, ShieldCheck, Gift, Church, CalendarDays, CalendarRange, RadioTower, Sunrise, Images, MessageSquare, LayoutDashboard, UserCircle, HandCoins, Menu, Newspaper } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../../store/authStore";
import { useNotificationsStore } from "../../store/notificationsStore";
import { canAccessAdminPage } from "../../lib/constants";
import { RoleBadge } from "../ui/Badge";
import NotificationBell from "../../features/notifications/components/NotificationBell";
import Avatar from "../ui/Avatar";

const ADMIN_LINKS = [
  { to: "/admin", label: "Tableau de bord", icon: BarChart3, end: true },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: UsersRound },
  { to: "/admin/actualites", label: "Actualités", icon: Newspaper },
  { to: "/admin/medias", label: "Médias", icon: Images },
  { to: "/admin/moderation", label: "Modération", icon: ShieldCheck },
  { to: "/admin/dons-contacts", label: "Dons & contacts", icon: Gift },
  { to: "/admin/abonnes", label: "Abonnés", icon: Users },
  { to: "/admin/eglises", label: "Églises", icon: Church },
  { to: "/admin/evenements", label: "Événements", icon: CalendarDays },
  { to: "/admin/programmes", label: "Programmes", icon: CalendarRange },
  { to: "/admin/direct", label: "Diffusions", icon: RadioTower },
  { to: "/admin/prieres", label: "Prières", icon: Sunrise },
];

// Pages de l'espace membre — l'administrateur est aussi un membre
const MEMBER_LINKS = (unreadCount) => [
  { to: "/app", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/app/messagerie", label: "Messagerie", icon: MessageSquare, count: unreadCount || undefined },
  { to: "/app/profil", label: "Mon profil", icon: UserCircle },
  { to: "/app/dons", label: "Mes dons", icon: HandCoins },
];

export default function AdminShellLayout() {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = ADMIN_LINKS.filter((l) => canAccessAdminPage(user?.role, l.to));

  return (
    <div className="flex min-h-screen bg-sand">
      <Sidebar
        links={links}
        secondaryTitle="Mon espace"
        secondaryLinks={MEMBER_LINKS(unreadCount)}
        badgeTag={user?.role ? undefined : "Admin"}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 justify-between px-4 md:px-8 py-4 md:py-5 bg-white border-b border-line">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-ink hover:bg-sand-2 transition"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display text-xl md:text-2xl">Back-office ETDV</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
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