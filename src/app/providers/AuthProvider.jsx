import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth.api";

export default function AuthProvider({ children }) {
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        // Tente un refresh silencieux via le cookie httpOnly déjà présent (session existante)
        const refreshRes = await authApi.refresh();
        const accessToken = refreshRes.data.accessToken;
        // Indispensable : l'intercepteur axios lit le store pour injecter le Bearer
        useAuthStore.getState().setAccessToken(accessToken);
        const meRes = await authApi.me();
        if (!cancelled) {
          loginSuccess({ user: meRes.data, accessToken });
        }
      } catch {
        if (!cancelled) setHydrating(false);
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="arc-badge" style={{ "--pct": 60 }}>
          <span className="font-mono text-[10px]">ETDV</span>
        </div>
      </div>
    );
  }

  return children;
}
