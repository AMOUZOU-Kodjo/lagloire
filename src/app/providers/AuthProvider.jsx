import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth.api";

export default function AuthProvider({ children }) {
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // Ordre de restauration :
      //   1) refresh token mémorisé (survit au blocage des cookies tiers)
      //   2) cookie httpOnly classique
      const stored = useAuthStore.getState().refreshToken;
      try {
        const res = await authApi.refresh(stored || undefined);
        const { accessToken, refreshToken } = res.data;
        useAuthStore.getState().setAccessToken(accessToken);
        const meRes = await authApi.me();
        if (!cancelled) {
          useAuthStore.getState().loginSuccess({ user: meRes.data, accessToken, refreshToken });
        }
      } catch {
        if (!cancelled) {
          useAuthStore.getState().logout();
          setHydrating(false);
        }
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
