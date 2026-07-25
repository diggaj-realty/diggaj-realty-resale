export type UserRole = "BUYER" | "SELLER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
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
