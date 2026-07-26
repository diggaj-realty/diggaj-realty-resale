export type UserRole = "BUYER" | "SELLER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  /** Primary/original role. For a dual-role account, prefer `roles` — this alone no longer tells the whole story. */
  role: UserRole;
  /** All roles held by this account (e.g. a seller who also buys). Always non-empty; falls back to `[role]`. */
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type GoogleAuthResponse = LoginResponse & {
  isNewUser: boolean;
};
