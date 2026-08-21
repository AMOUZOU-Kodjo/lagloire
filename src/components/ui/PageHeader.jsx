/** En-tête de page standard — unifie les titres + actions de toutes les pages. */
export default function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 ${className}`}>
      <div>
        {eyebrow && <div className="divider-eyebrow mb-2">{eyebrow}</div>}
        <h1 className="font-display text-2xl">{title}</h1>
        {description && <p className="text-sm text-soft mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}