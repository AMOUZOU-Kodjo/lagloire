import { Link } from "react-router-dom";
import { Feather, Lock, MessageCircle } from "lucide-react";

const FEATURES_DEFAULT = [
  { icon: Feather, text: "Un seul compte pour toute la communauté" },
  { icon: Lock, text: "Connexion sécurisée sans mot de passe" },
  { icon: MessageCircle, text: "Messagerie, dons et événements réunis" },
];

function BrandLockup({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/etdv_logo.png"
        alt="Logo Église Temple du Dieu Vivant"
        className={`rounded-full object-cover ${compact ? "w-9 h-9" : "w-12 h-12"} ring-2 ring-white/15 shadow-lg shadow-black/20`}
      />
      <div className="leading-tight">
        <p className={`font-display text-ink ${compact ? "text-lg" : "text-2xl"}`}>
          Église <span className="text-gold">ETDV</span>
        </p>
        <p className={`font-mono uppercase text-soft ${compact ? "text-[9px] tracking-[.14em]" : "text-[10px] tracking-[.18em] mt-1"}`}>
          Temple du Dieu Vivant
        </p>
      </div>
    </div>
  );
}

/**
 * Cadre d'authentification split-screen : panneau de marque ETDV (dégradé sombre
 * + arc signature "Arc de l'Aube") à gauche, contenu (formulaire) à droite.
 * Mobile : logo compact au-dessus.
 */
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  features = FEATURES_DEFAULT,
  quote,
  quoteRef,
  footerNote,
  children,
}) {
  return (
    <div className="grid lg:grid-cols-2 min-h-dvh bg-sand">
      {/* Panneau de marque */}
      <aside className="relative hidden lg:flex flex-col justify-between px-12 py-10 overflow-hidden text-white">
        {/* Fond : dégradé sombre + arc de l'aube signature */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(160deg, #12282c 0%, #0c1a1e 48%, #12323a 100%)" }}
        >
          <div className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full bg-gold/15 blur-[120px]" />
          <div
            className="absolute -bottom-[54%] left-1/2 -translate-x-1/2 w-[1300px] h-[1300px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, rgba(55,205,190,.18) 0%, rgba(55,205,190,.06) 34%, rgba(55,205,190,0) 60%)",
            }}
          />
          <div className="absolute -bottom-[44%] left-1/2 -translate-x-1/2 w-[1080px] h-[1080px] rounded-full border-t border-gold/25" />
          <div className="absolute -bottom-[32%] left-1/2 -translate-x-1/2 w-[820px] h-[820px] rounded-full border-t border-gold/15" />
        </div>

        {/* En-tête : logo */}
        <div className="relative z-10">
          <BrandLockup />
        </div>

        {/* Contenu central */}
        <div className="relative z-10 max-w-md">
          {quote && (
            <blockquote className="font-display text-[26px] leading-snug text-white/95">
              {quote}
              {quoteRef && (
                <footer className="mt-4 flex items-center gap-2.5 text-sm font-sans text-white/55">
                  <span className="w-9 h-px bg-gold/70" />
                  {quoteRef}
                </footer>
              )}
            </blockquote>
          )}

          <ul className="mt-12 space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3.5 text-sm text-white/85">
                <span className="w-9 h-9 rounded-full bg-white/[.07] border border-white/10 flex items-center justify-center flex-shrink-0">
                  {typeof f.icon === "string" ? (
                    <span className="text-base leading-none">{f.icon}</span>
                  ) : (
                    <f.icon size={16} className="text-gold" strokeWidth={2} />
                  )}
                </span>
                <span className="leading-snug">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {footerNote && (
          <p className="relative z-10 flex items-center gap-2 text-xs text-white/45 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/70" />
            {footerNote}
          </p>
        )}
      </aside>

      {/* Contenu */}
      <main className="flex flex-col min-h-dvh">
        <div className="flex items-center justify-between px-6 md:px-10 py-5">
          <Link to="/" className="lg:hidden">
            <BrandLockup compact />
          </Link>
          <Link
            to="/"
            className="ml-auto text-sm text-soft hover:text-ink transition inline-flex items-center gap-1.5"
          >
            ← Retour au site
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="divider-eyebrow mb-5">{eyebrow}</div>
            <h1 className="font-display text-3xl text-ink">{title}</h1>
            <p className="text-sm mt-2.5 text-soft leading-relaxed">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export { FEATURES_DEFAULT };