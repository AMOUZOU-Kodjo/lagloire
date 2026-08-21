import { Link, NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth.api";
import { Badge } from "../ui/Badge";

export default function Sidebar({ links, secondaryTitle, secondaryLinks = [], badgeTag, onLogoutPath = "/" }) {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  async function handleLogout() {
    try {
      await authApi.logout();
    } finally {
      logout();
      window.location.href = onLogoutPath;
    }
  }

  const renderLink = (link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
      >
        <Icon size={18} strokeWidth={2} />
        <span>{link.label}</span>
        {link.count ? <Badge tone={link.tone ?? "gold"} className="ml-auto">{link.count}</Badge> : null}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col bg-white border-r border-line sticky top-0 h-screen overflow-y-auto">
      <Link to="/" className="flex items-center gap-2.5 px-5 py-6">
        <img
          src="/etdv_logo.png"
          alt="Logo Église ETDV"
          className="w-9 h-9 rounded-full object-cover border-2 border-gold"
        />
        <span className="leading-tight min-w-0">
          <span className="block font-display text-lg text-ink">ETDV</span>
          {user && (
            <span className="block text-[11px] text-soft truncate">
              {user.firstName} {user.lastName}
            </span>
          )}
        </span>
        {badgeTag && <Badge tone="gold" className="ml-auto">{badgeTag}</Badge>}
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(renderLink)}
        {secondaryLinks.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-soft">
                {secondaryTitle || "Mon espace"}
              </p>
            </div>
            {secondaryLinks.map(renderLink)}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-line">
        <button onClick={handleLogout} className="side-link w-full text-left">
          <LogOut size={18} strokeWidth={2} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}