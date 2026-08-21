/** Élément signature ETDV : arc teal filigrané, symbole du rituel quotidien de la prière matinale. */
export default function DawnArcHeader({ children, small = false, className = "" }) {
  return (
    <header className={`dawn-arc bg-sand-2 ${className}`}>
      <div className="dawn-arc-line" />
      {small && <div className="dawn-arc-line small" />}
      <div className="relative z-10">{children}</div>
    </header>
  );
}

export function ArcBadge({ percent = 70, label }) {
  return (
    <div className="flex items-center gap-4">
      <div className="arc-badge" style={{ "--pct": percent }}>
        <span>{percent}%</span>
      </div>
      {label && <div className="text-sm">{label}</div>}
    </div>
  );
}
