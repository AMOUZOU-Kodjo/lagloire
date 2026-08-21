import { useState, useEffect } from "react";

/**
 * État de pagination : page courante + reset automatique quand les filtres changent.
 * const { page, setPage, reset } = usePagination(1, [search]);
 */
export function usePagination(initialPage = 1, resetDeps = []) {
  const [page, setPage] = useState(initialPage);
  const signature = resetDeps.join("|");

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage, signature]);

  return { page, setPage, reset: () => setPage(initialPage) };
}