"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { CheckoutData, CheckoutDataRaw } from "@/types/checkout";

export const checkoutKeys = {
  all: ["checkout"] as const,
};

type CheckoutResponseRaw = ApiResponse<CheckoutDataRaw>;
type CheckoutResponse = ApiResponse<CheckoutData>;

function mapCheckoutResponse(raw: CheckoutResponseRaw): CheckoutResponse {
  return {
    ...raw,
    data: {
      user: {
        name: raw.data.user.name,
        email: raw.data.user.email,
        phone: raw.data.user.nomorHandphone, 
      },
      items: raw.data.items,
      itemCount: raw.data.itemCount,
    },
  };
}

export function useCheckoutQuery() {
  return useQuery<CheckoutResponse>({
    queryKey: checkoutKeys.all,
    queryFn: async () => {
      const raw = await api.get<CheckoutResponseRaw>(ENDPOINTS.cart.checkout);
      return mapCheckoutResponse(raw);
    },
  });
}
