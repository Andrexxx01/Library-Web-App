"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { CategoriesData } from "@/types/category";

export const categoryKeys = {
  all: ["categories"] as const,
};

type CategoriesResponse = ApiResponse<CategoriesData>;

export function useCategoriesQuery() {
  return useQuery<CategoriesResponse>({
    queryKey: categoryKeys.all,
    queryFn: () => api.get<CategoriesResponse>(ENDPOINTS.categories.list),
  });
}
