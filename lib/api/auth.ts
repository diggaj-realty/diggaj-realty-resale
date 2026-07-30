import { ApiError } from "@/lib/api/client";
import type { AuthUser, GoogleAuthResponse, LoginResponse, UserRole } from "@/types/auth";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function authApi<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status, json?.error?.code);
  }
  return json.data as T;
}

export function login(email: string, password: string) {
  return authApi<LoginResponse>("/auth/login", { email, password });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}) {
  return authApi<LoginResponse>("/auth/register", input);
}

// Public-API equivalent of /auth/register + /auth/login combined — the
// frontend gets an ID token from Google Identity Services and the backend
// verifies it server-side, so a raw idToken is trusted input here only in
// the sense that the backend re-verifies it against Google before use.
export function googleAuth(idToken: string, role: UserRole, phone?: string) {
  return authApi<GoogleAuthResponse>("/auth/google", { idToken, role, phone });
}

/** Adds the other public role (BUYER/SELLER) to an existing account, instead
 *  of requiring a second signup — e.g. a seller who now also wants to buy. */
export function addRole(token: string, role: UserRole) {
  return authApi<AuthUser>("/auth/roles", { role }, token);
}

export async function me(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status, json?.error?.code);
  }
  return json.data as AuthUser;
}
