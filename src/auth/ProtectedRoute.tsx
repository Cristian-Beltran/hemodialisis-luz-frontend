// auth/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./useAuth";

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const { loadFromStorage, verifyToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        loadFromStorage();
        await verifyToken();
        const { user } = useAuthStore.getState();
        if (!user?.id) throw new Error("No user ID after verification");
        // No navegar: ya estás en location.pathname
      } catch (err) {
        useAuthStore.getState().logout();
        console.error(err);
        navigate("/login", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  return <>{children}</>;
};
