import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { canAccessAdminPage } from "../../../lib/constants";

/**
 * Garde d'une page du back-office par rôle (miroir des requireRole backend).
 * Un pasteur accédant directement à /admin/moderation est redirigé vers le tableau de bord.
 */
export default function AdminPageGuard({ path, children }) {
  const user = useAuthStore((s) => s.user);
  if (!canAccessAdminPage(user?.role, path)) return <Navigate to="/admin" replace />;
  return children;
}