import { authedSend } from "@/lib/api/authed";
import type { AuthUser } from "@/types/auth";

// Note: there's no GET /profile — /auth/me (lib/api/auth.ts's `me`) already
// returns the same user shape and is used for the initial load.
export const updateProfile = (token: string, input: { name: string; phone?: string }) =>
  authedSend<AuthUser>("/profile", token, { method: "PATCH", body: input });

export const changePassword = (
  token: string,
  input: { currentPassword: string; newPassword: string }
) => authedSend<{ ok: boolean }>("/profile/password", token, { method: "POST", body: input });
