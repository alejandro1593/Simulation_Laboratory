import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken, ApiError } from "../api/client";

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  zone: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api<User>("/auth/me", { authed: true })
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const applyTokens = useCallback((data: { user: User; access_token: string }) => {
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api<{ user: User; access_token: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      applyTokens(data);
    },
    [applyTokens],
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const data = await api<{ user: User; access_token: string }>("/auth/register", {
        method: "POST",
        body: { email, username, password },
      });
      applyTokens(data);
    },
    [applyTokens],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export { ApiError };