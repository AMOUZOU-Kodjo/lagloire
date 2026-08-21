import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../api/auth.api";
import { useAuthStore } from "../../../store/authStore";

/**
 * Connexion responsable (email + mot de passe) du back-office.
 * Encapsule l'état, les erreurs et la navigation. Utilisé par AdminConnexionPage.
 */
export function useAdminLogin() {
  const navigate = useNavigate();
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      loginSuccess(res.data);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }, [email, password, loginSuccess, navigate]);

  return { email, setEmail, password, setPassword, error, loading, submit };
}