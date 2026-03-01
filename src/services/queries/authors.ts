"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type {
  AuthorsData,
  AuthorsQueryParams,
  PopularAuthorsData,
} from "@/types/authors";

export const authorKeys = {
  all: ["authors"] as const,
  list: (params?: AuthorsQueryParams) =>
    ["authors", "list", params ?? {}] as const,
  popular: () => ["authors", "popular"] as const,
};

type AuthorsResponse = ApiResponse<AuthorsData>;
type PopularAuthorsResponse = ApiResponse<PopularAuthorsData>;

export function useAuthorsQuery(params?: AuthorsQueryParams) {
  const q = params?.q?.trim() ? params.q.trim() : undefined;

  return useQuery<AuthorsResponse>({
    queryKey: authorKeys.list({ q }),
    queryFn: () =>
      api.get<AuthorsResponse>(ENDPOINTS.author.list, {
        query: { q },
      }),
  });
}

export function usePopularAuthorsQuery() {
  return useQuery<PopularAuthorsResponse>({
    queryKey: authorKeys.popular(),
    queryFn: () => api.get<PopularAuthorsResponse>(ENDPOINTS.author.popular),
    staleTime: 1000 * 60 * 10,
  });
}