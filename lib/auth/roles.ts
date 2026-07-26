import type { AuthUser, UserRole } from "@/types/auth";

/** Whether the account holds a given role — checks the full `roles` array
 *  (falling back to the legacy single `role` field for older cached
 *  sessions), so a dual-role account (e.g. seller who also buys) isn't
 *  wrongly gated out of either side. */
export function hasRole(user: AuthUser | null | undefined, role: UserRole): boolean {
  if (!user) return false;
  return (user.roles?.length ? user.roles : [user.role]).includes(role);
}
