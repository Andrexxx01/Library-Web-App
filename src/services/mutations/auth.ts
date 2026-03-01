"use client";

import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { setCredentials } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

import type { ApiResponse } from "@/types/api";
import type { LoginData, User } from "@/types/auth";

/* =========================
   Request Payload Types
========================= */

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

/* =========================
   Response Types (based on your Swagger)
========================= */

type LoginResponse = ApiResponse<LoginData>; // 200
type RegisterResponse = ApiResponse<User>; // 201

/* =========================
   Mutations
========================= */

/**
 * Login mutation:
 * - POST /api/auth/login (200)
 * - On success: save token + user into Redux via setCredentials
 */
export function useLoginMutation() {
  const dispatch = useAppDispatch();

  return useMutation<LoginResponse, ApiError, LoginPayload>({
    mutationFn: (payload) =>
      api.post<LoginResponse>(ENDPOINTS.auth.login, payload, { auth: false }),

    onSuccess: (res) => {
      // res.data = { token, user }
      dispatch(
        setCredentials({
          token: res.data.token,
          user: res.data.user,
        }),
      );
    },
  });
}

/**
 * Register mutation:
 * - POST /api/auth/register (201)
 * - On success: returns the created user (no token)
 */
export function useRegisterMutation() {
  return useMutation<RegisterResponse, ApiError, RegisterPayload>({
    mutationFn: (payload) =>
      api.post<RegisterResponse>(ENDPOINTS.auth.register, payload, {
        auth: false,
      }),
  });
}
