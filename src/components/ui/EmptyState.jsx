export function EmptyState({ icon = "🕊️", title, description, action }) {
  const isComponent = typeof icon !== "string";
  return (
    <div className="text-center py-16 px-6">
      {isComponent ? (
        <div className="mx-auto w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold-dim">
          {icon}
        </div>
      ) : (
        <div className="text-4xl mb-4">{icon}</div>
      )}
      <p className="font-display text-xl mt-4">{title}</p>
      {description && <p className="text-sm text-soft mt-2 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card rounded-lg overflow-hidden">
      <Skeleton className="h-24 rounded-none border-0" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}