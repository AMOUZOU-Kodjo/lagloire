import Button from "./Button";

function getPageNumbers(page, pages) {
  const set = new Set([1, pages, page - 1, page, page + 1]);
  return [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
}

export default function Pagination({ pagination, onPageChange, className = "" }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  const numbers = getPageNumbers(page, pages);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-soft mt-8 ${className}`}>
      <span className="text-xs">
        Page {page} sur {pages} · {total} résultat{total > 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Page précédente">
          ←
        </Button>
        {numbers.map((n, i) => {
          const prev = numbers[i - 1];
          const gap = prev && n - prev > 1;
          return (
            <span key={n} className="flex items-center gap-1.5">
              {gap && <span className="px-1 text-soft">…</span>}
              <button
                onClick={() => onPageChange(n)}
                aria-current={n === page ? "page" : undefined}
                className={`min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
                  n === page
                    ? "bg-gold text-white shadow-sm"
                    : "text-soft hover:bg-sand-2 hover:text-ink"
                }`}
              >
                {n}
              </button>
            </span>
          );
        })}
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Page suivante">
          →
        </Button>
      </div>
    </div>
  );
}