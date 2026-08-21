import { EmptyState } from "./EmptyState";
import Pagination from "./Pagination";

/**
 * Tableau de données réutilisable — remplace les <table> dupliqués des pages Admin.
 *
 * columns : [{ key, label, render?(row), className?, headerClassName? }]
 * rows    : données à afficher
 * keyField: champ clé (défaut "id")
 * loading : affiche un squelette de chargement
 * empty   : contenu affiché quand rows est vide (par défaut EmptyState)
 * pagination + onPageChange : rendus en pied de tableau
 */
export default function DataTable({
  columns,
  rows = [],
  keyField = "id",
  loading = false,
  empty,
  onRowClick,
  pagination,
  onPageChange,
  className = "",
}) {
  if (loading) {
    return (
      <div className={`card rounded-lg overflow-hidden ${className}`}>
        <div className="space-y-3 p-5">
          <div className="skeleton h-8 w-full rounded-md" />
          <div className="skeleton h-8 w-full rounded-md" />
          <div className="skeleton h-8 w-3/4 rounded-md" />
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      empty ?? (
        <EmptyState icon="🗂️" title="Aucun élément" description="Rien à afficher pour le moment." />
      )
    );
  }

  return (
    <div className={`card rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="table table-md">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.headerClassName}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} className="px-5 py-4" />}
    </div>
  );
}