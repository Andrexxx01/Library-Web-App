"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { MyLoansData } from "@/types/loan";

export const loanKeys = {
  all: ["loans"] as const,
  my: () => ["loans", "me"] as const,
};

type MyLoansResponse = ApiResponse<MyLoansData>;

export function useMyLoansQuery() {
  return useQuery<MyLoansResponse>({
    queryKey: loanKeys.my(),
    queryFn: () => api.get<MyLoansResponse>(ENDPOINTS.profile.allLoan),
  });
}
