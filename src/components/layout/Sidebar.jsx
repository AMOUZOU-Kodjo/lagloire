import { Link, NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth.api";
import { Badge } from "../ui/Badge";

function NavLinks({ links }) {
  return links.map((link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        onClick={link.onNavigate}
        className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
      >
        <Icon size={18} strokeWidth={2} />
        <span>{link.label}</span>
        {link.count ? <Badge tone={link.tone ?? "gold"} className="ml-auto">{link.count}</Badge> : null}
      </NavLink>
    );
  });
}

export default function Sidebar({
  links,
  secondaryTitle,
  secondaryLinks = [],
  badgeTag,
  onLogoutPath = "/",
  // Drawer mobile (rendu < lg)
  mobileOpen = false,
  onCloseMobile,
}) {
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

  return (
    <>
      {/* Desktop */}
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
          <NavLinks links={links} />
          {secondaryLinks.length > 0 && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-soft">
                  {secondaryTitle || "Mon espace"}
                </p>
              </div>
              <NavLinks links={secondaryLinks} />
            </>
          )}
        </nav>

        <div className="p-3 border-t border-line">
          <button onClick={handleLogout} className="side-link w-full text-left">
            <LogOut size={18} strokeWidth={2} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile / tablette : drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="relative w-72 max-w-[85vw] h-full bg-white border-r border-line shadow-xl flex flex-col overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between px-4 py-4 border-b border-line">
              <Link to="/" className="flex items-center gap-2.5" onClick={onCloseMobile}>
                <img
                  src="/etdv_logo.png"
                  alt="Logo Église ETDV"
                  className="w-9 h-9 rounded-full object-cover border-2 border-gold"
                />
                <span className="leading-tight">
                  <span className="block font-display text-lg text-ink">ETDV</span>
                  {user && (
                    <span className="block text-[11px] text-soft truncate max-w-[140px]">
                      {user.firstName} {user.lastName}
                    </span>
                  )}
                </span>
              </Link>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Fermer le menu"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-soft hover:bg-sand-2 transition"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-1">
              <NavLinks links={links.map((l) => ({ ...l, onNavigate: onCloseMobile }))} />
              {secondaryLinks.length > 0 && (
                <>
                  <div className="pt-4 pb-1 px-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-soft">
                      {secondaryTitle || "Mon espace"}
                    </p>
                  </div>
                  <NavLinks links={secondaryLinks.map((l) => ({ ...l, onNavigate: onCloseMobile }))} />
                </>
              )}
            </nav>

            <div className="p-3 border-t border-line">
              <button onClick={handleLogout} className="side-link w-full text-left">
                <LogOut size={18} strokeWidth={2} /> Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
