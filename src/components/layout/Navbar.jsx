import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, User, Heart, ShieldCheck, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { STAFF_ROLES } from "../../lib/constants";
import { authApi } from "../../api/auth.api";

const LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/a-propos", label: "À propos" },
  { to: "/programme", label: "Programme" },
  { to: "/evenements", label: "Événements" },
  { to: "/actualites", label: "Actualités" },
  { to: "/prieres-matinales", label: "Prières matinales" },
  { to: "/galerie", label: "Galerie" },
  { to: "/eglises", label: "Nos Églises" },
  { to: "/contact", label: "Contact" },
];

const ACCENT = "#37cdbe";

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const isStaff = STAFF_ROLES.includes(user?.role);
  const home = isStaff ? "/admin" : "/app";
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await authApi.logout();
    } catch {
      /* le logout local suffit */
    }
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e5e6e6]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/etdv_logo.png"
            alt="Logo Église ETDV"
            className="h-10 w-10 rounded-full object-cover border-2"
            style={{ borderColor: ACCENT }}
          />
          <div className="leading-tight">
            <p className="font-display text-lg text-[#1f2937]">Église <span style={{ color: ACCENT }}>ETDV</span></p>
            <p className="text-xs text-[#6b7280]">Site officiel</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "text-[#37cdbe] bg-[#37cdbe]/10 font-medium"
                    : "text-[#4b5563] hover:text-[#37cdbe] hover:bg-[#37cdbe]/10"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/don"
            aria-label="Faire un don"
            title="Faire un don"
            className="hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-full border border-[#37cdbe] text-[#37cdbe] hover:bg-[#37cdbe]/10 hover:scale-105 transition"
          >
            <Heart size={18} />
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label={`Menu ${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-bold text-white border-2 border-white shadow-sm ring-1 ring-[#e5e6e6] hover:ring-[#37cdbe] hover:scale-105 transition"
                style={{ background: isStaff ? "#1f2937" : ACCENT }}
              >
                {user?.profile?.avatarUrl ? (
                  <img
                    src={user.profile.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#e5e6e6] bg-white shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#e5e6e6]">
                    <p className="text-sm font-semibold text-[#1f2937] truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[11px] font-mono uppercase tracking-wide text-[#37cdbe] mt-0.5">
                      {isStaff ? "Responsable · Back-office" : "Membre"}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/app/profil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#f2f2f2] transition"
                    >
                      <User size={15} className="text-[#6b7280]" />
                      Mon profil
                    </Link>
                    <Link
                      to={home}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#374151] hover:bg-[#f2f2f2] transition"
                    >
                      {isStaff ? (
                        <ShieldCheck size={15} className="text-[#6b7280]" />
                      ) : (
                        <LayoutDashboard size={15} className="text-[#6b7280]" />
                      )}
                      {isStaff ? "Back-office" : "Espace membre"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#dc2626] hover:bg-[#f2f2f2] transition"
                    >
                      <LogOut size={15} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/connexion"
              className="px-4 py-2 rounded-lg bg-[#37cdbe] text-white text-sm font-medium hover:bg-[#37cdbe]/90 transition"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}