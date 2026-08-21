/** Chargement plein écran — à utiliser comme fallback de Suspense et pour les transitions. */
export default function PageLoader({ label = "Chargement…" }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="arc-badge" style={{ "--pct": 60 }}>
        <span className="font-mono text-[10px]">ETDV</span>
      </div>
      <span className="loading loading-spinner loading-lg text-gold" />
      <p className="text-xs font-mono uppercase tracking-[.15em] text-soft">{label}</p>
    </div>
  );
}