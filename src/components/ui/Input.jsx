/** Champ de saisie standard — supporte une icône à gauche et un élément à droite (œil, bouton). */
export function Input({ label, dark = false, error, icon, trailing, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className={`text-xs font-mono block mb-1.5 ${dark ? "text-soft-dark" : "text-soft"}`}>{label}</span>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft pointer-events-none flex">{icon}</span>
        )}
        <input
          className={`input ${dark ? "input-dark" : ""} ${icon ? "pl-10" : ""} ${trailing ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {trailing && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">{trailing}</span>
        )}
      </div>
      {error && <span className="text-xs text-brick mt-1 block">{error}</span>}
    </label>
  );
}

export function Textarea({ label, dark = false, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className={`text-xs font-mono block mb-1.5 ${dark ? "text-soft-dark" : "text-soft"}`}>{label}</span>}
      <textarea className={`textarea ${dark ? "input-dark" : ""} ${className}`} {...props} />
      {error && <span className="text-xs text-brick mt-1 block">{error}</span>}
    </label>
  );
}

export function Select({ label, dark = false, error, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className={`text-xs font-mono block mb-1.5 ${dark ? "text-soft-dark" : "text-soft"}`}>{label}</span>}
      <select className={`select ${dark ? "input-dark" : ""} ${className}`} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-brick mt-1 block">{error}</span>}
    </label>
  );
}