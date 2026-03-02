import type { ApiResponse } from "./api";

export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  profilePhoto: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
};

export type LoginData = {
  token: string;
  user: User;
};

export type LoginResponse = ApiResponse<LoginData>;
