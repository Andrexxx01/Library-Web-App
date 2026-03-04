"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type {
  CheckoutData,
  CheckoutDataRaw,
  DurationDays,
  LoanDirectPayload,
  LoanDirectResponseData,
  LoansFromCartPayload,
  LoansFromCartResponseData,
  MeData,
  MeDataRaw,
} from "@/types/checkout";

export const checkoutKeys = {
  all: ["checkout"] as const,
};

export const meKeys = {
  all: ["me"] as const,
};

export const loanKeys = {
  all: ["loans"] as const,
  fromCart: () => ["loans", "from-cart"] as const,
  direct: () => ["loans", "direct"] as const,
};

export function pickErrMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

type CheckoutResponseRaw = ApiResponse<CheckoutDataRaw>;
type CheckoutResponse = ApiResponse<CheckoutData>;

function mapCheckoutResponse(raw: CheckoutResponseRaw): CheckoutResponse {
  return {
    ...raw,
    data: {
      user: {
        name: raw.data.user.name,
        email: raw.data.user.email,
        phone: raw.data.user.nomorHandphone ?? null,
      },
      items: raw.data.items,
      itemCount: raw.data.itemCount,
    },
  };
}

type MeResponseRaw = ApiResponse<MeDataRaw>;
type MeResponse = ApiResponse<MeData>;

function mapMeResponse(raw: MeResponseRaw): MeResponse {
  return {
    ...raw,
    data: {
      profile: {
        ...raw.data.profile,
        phone: raw.data.profile.phone ?? null,
        profilePhoto: raw.data.profile.profilePhoto ?? null,
      },
      loanStats: raw.data.loanStats,
      reviewsCount: raw.data.reviewsCount,
    },
  };
}

export function useMeQuery(opts?: { enabled?: boolean }) {
  return useQuery<MeResponse>({
    queryKey: meKeys.all,
    enabled: opts?.enabled ?? true,
    queryFn: async () => {
      const raw = await api.get<MeResponseRaw>("/api/me");
      return mapMeResponse(raw);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useCheckoutQuery(opts?: { enabled?: boolean }) {
  return useQuery<CheckoutResponse>({
    queryKey: checkoutKeys.all,
    enabled: opts?.enabled ?? true,
    queryFn: async () => {
      const raw = await api.get<CheckoutResponseRaw>(ENDPOINTS.cart.checkout);
      return mapCheckoutResponse(raw);
    },
    staleTime: 1000 * 10,
    refetchOnWindowFocus: false,
  });
}

export const useCartCheckoutQuery = useCheckoutQuery;

export function useRemoveCartItemMutation() {
  const qc = useQueryClient();

  return useMutation<ApiResponse<{ id: number }>, Error, { itemId: number }>({
    mutationFn: ({ itemId }) =>
      api.delete<ApiResponse<{ id: number }>>(
        ENDPOINTS.cart.deleteItem(itemId),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: checkoutKeys.all });
    },
  });
}

export function useLoansFromCartMutation() {
  const qc = useQueryClient();

  return useMutation<
    ApiResponse<LoansFromCartResponseData>,
    Error,
    LoansFromCartPayload
  >({
    mutationKey: loanKeys.fromCart(),
    mutationFn: (payload) =>
      api.post<ApiResponse<LoansFromCartResponseData>>("/api/loans/from-cart", {
        itemIds: payload.itemIds,
        borrowDate: payload.borrowDate,
        durationDays: payload.durationDays,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: checkoutKeys.all });
      qc.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}

export function useLoanDirectMutation() {
  const qc = useQueryClient();

  return useMutation<
    ApiResponse<LoanDirectResponseData>,
    Error,
    LoanDirectPayload
  >({
    mutationKey: loanKeys.direct(),
    mutationFn: (payload) => {
      const durationDays: DurationDays = payload.durationDays;
      return api.post<ApiResponse<LoanDirectResponseData>>("/api/loans", {
        bookId: payload.bookId,
        durationDays,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: checkoutKeys.all });
      qc.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}
