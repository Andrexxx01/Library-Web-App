export type UserRole = "USER" | "ADMIN";

export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
};

export type AuthState = {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
};