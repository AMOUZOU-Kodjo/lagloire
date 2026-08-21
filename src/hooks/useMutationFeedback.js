import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

/**
 * Wrapper useMutation : affiche un toast de succès/erreur et invalide les
 * requêtes concernées automatiquement. Toutes les mutations du projet passent par ici.
 *
 * @param {object} options
 * @param {Function} options.mutationFn
 * @param {Array} options.invalidate  - listes de queryKeys à invalider (ex. [queryKeys.events.all])
 * @param {string} options.successMessage
 * @param {string} options.errorMessage
 * @param {Function} [options.onSuccess] - appelée après le toast (reset form, fermeture modal…)
 */
export function useMutationFeedback({
  mutationFn,
  invalidate = [],
  successMessage = "Opération réussie.",
  errorMessage = "Une erreur est survenue, réessayez.",
  onSuccess,
  onError,
  ...mutationOptions
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      toast.success(successMessage);
      invalidate.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(extractErrorMessage(error, errorMessage));
      onError?.(error, variables, context);
    },
  });
}