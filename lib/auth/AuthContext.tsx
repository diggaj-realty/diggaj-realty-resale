"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { me as fetchMe } from "@/lib/api/auth";
import { clearAllChats } from "@/lib/ai/chatStore";
import type { AuthUser } from "@/types/auth";

const STORAGE_KEY = "diggaj_auth_token";
// Caches the last-known full user object alongside the token so a repeat
// visit can render as logged-in immediately (no network wait) instead of
// blocking every page — including the dashboard — behind a fresh /auth/me
// round trip before anything can render. Still reconciled with a real
// fetchMe() call in the background; a failure there clears both and logs
// the session out, same as before this existed.
const USER_STORAGE_KEY = "diggaj_auth_user";

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
    const cachedUserRaw = stored ? window.localStorage.getItem(USER_STORAGE_KEY) : null;
    let cachedUser: AuthUser | null = null;
    if (cachedUserRaw) {
      try {
        cachedUser = JSON.parse(cachedUserRaw) as AuthUser;
      } catch {
        cachedUser = null;
      }
    }

    // Optimistic: a cached user from a prior visit renders as logged-in
    // almost immediately (deferred one microtask, not a real network wait)
    // — fetchMe below still runs to reconcile/verify, but the UI doesn't sit
    // and wait for it. Deferred via microtask rather than called directly
    // here since setState synchronously in an effect body risks cascading
    // renders (react-hooks/set-state-in-effect) — a microtask still resolves
    // long before fetchMe's network round trip ever could.
    if (stored && cachedUser) {
      queueMicrotask(() => {
        setToken(stored);
        setUser(cachedUser);
        setLoading(false);
      });
    }

    // Verification/refresh path — its own state updates stay inside promise
    // callbacks (the optimistic block above is the deliberate exception,
    // since it needs to render before this network call even resolves).
    const load = stored ? fetchMe(stored) : Promise.resolve(null);
    load
      .then((u) => {
        if (stored && u) {
          setToken(stored);
          setUser(u);
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
        }
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = useCallback((newToken: string, newUser: AuthUser) => {
    window.localStorage.setItem(STORAGE_KEY, newToken);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    // Saved AI chats live in sessionStorage and are not per-account, so without
    // this the next person to sign in on this tab would inherit the previous
    // user's conversation — including their budget and shortlisted areas.
    clearAllChats();
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
