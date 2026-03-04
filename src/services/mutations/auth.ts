"use client";

import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { setCredentials } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import type { ApiResponse } from "@/types/api";
import type { LoginData, User } from "@/types/auth";

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

type RegisterApiPayload = Omit<RegisterPayload, "confirmPassword">;

export type LoginResponse = ApiResponse<LoginData>; 
export type RegisterResponse = ApiResponse<User>; 

export function useLoginMutation() {
  const dispatch = useAppDispatch();

  return useMutation<LoginResponse, ApiError, LoginPayload>({
    mutationFn: (payload) =>
      api.post<LoginResponse>(ENDPOINTS.auth.login, payload, { auth: false }),
    onSuccess: (res) => {
      dispatch(
        setCredentials({
          token: res.data.token,
          user: res.data.user,
        }),
      );
    },
  });
}

export function useRegisterMutation() {
  return useMutation<RegisterResponse, ApiError, RegisterPayload>({
    mutationFn: ({ confirmPassword: _confirmPassword, ...payload }) =>
      api.post<RegisterResponse>(
        ENDPOINTS.auth.register,
        payload as RegisterApiPayload,
        { auth: false },
      ),
  });
}
