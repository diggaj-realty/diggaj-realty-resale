import { ApiError } from "@/lib/api/client";
import type { AuthUser, LoginResponse, UserRole } from "@/types/auth";

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
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status);
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
  phone?: string;
  role: UserRole;
}) {
  return authApi<LoginResponse>("/auth/register", input);
}

export async function me(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status);
  }
  return json.data as AuthUser;
}
