"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { CartData } from "@/types/cart";

export const cartKeys = {
  all: ["cart"] as const,
};

type CartResponse = ApiResponse<CartData>;

export function useCartQuery() {
  return useQuery<CartResponse>({
    queryKey: cartKeys.all,
    queryFn: () => api.get<CartResponse>(ENDPOINTS.cart.list),
  });
}
