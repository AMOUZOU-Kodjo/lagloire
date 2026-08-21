import { useCallback } from "react";
import { useToastStore } from "../store/toastStore";

/**
 * API de notifications légères (toasts). À utiliser dans les composants et hooks.
 * const toast = useToast(); toast.success("Créé !"); toast.error("Oups…");
 */
export function useToast() {
  const show = useToastStore((s) => s.show);

  return {
    success: useCallback(
      (message, title) => show({ message, type: "success", title }),
      [show]
    ),
    error: useCallback(
      (message, title) => show({ message, type: "error", title, duration: 6000 }),
      [show]
    ),
    info: useCallback((message, title) => show({ message, type: "info", title }), [show]),
  };
}

export function useDismissToast() {
  return useToastStore((s) => s.dismiss);
}