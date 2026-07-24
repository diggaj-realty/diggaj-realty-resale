"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { me as fetchMe } from "@/lib/api/auth";
import type { AuthUser } from "@/types/auth";

const STORAGE_KEY = "diggaj_auth_token";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // All state updates happen in promise callbacks (never synchronously in the
    // effect body) so we don't trigger cascading renders on mount.
    const load = stored ? fetchMe(stored) : Promise.resolve(null);
    load
      .then((u) => {
        if (stored && u) {
          setToken(stored);
          setUser(u);
        }
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((newToken: string, newUser: AuthUser) => {
    window.localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, setSession, logout }),
    [user, token, loading, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
