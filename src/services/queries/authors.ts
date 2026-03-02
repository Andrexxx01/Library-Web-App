"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type {
  Author,
  PopularAuthorsParams,
  PopularAuthorsResponse,
} from "@/types/author";

export type AuthorsData = {
  authors: Author[];
};

export type AuthorsQueryParams = {
  q?: string;
};

type AuthorsResponse = ApiResponse<AuthorsData>;

export const authorKeys = {
  all: ["authors"] as const,
  list: (params?: AuthorsQueryParams) =>
    ["authors", "list", params ?? {}] as const,
  popular: (limit: number) => ["authors", "popular", limit] as const,
};

export function useAuthorsQuery(params?: AuthorsQueryParams) {
  const q = params?.q?.trim() ? params.q.trim() : undefined;

  return useQuery<AuthorsResponse>({
    queryKey: authorKeys.list({ q }),
    queryFn: () =>
      api.get<AuthorsResponse>(ENDPOINTS.author.list, {
        query: { q },
      }),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePopularAuthorsQuery(params?: PopularAuthorsParams) {
  const limit = params?.limit ?? 10;

  return useQuery<PopularAuthorsResponse>({
    queryKey: authorKeys.popular(limit),
    queryFn: () =>
      api.get<PopularAuthorsResponse>(ENDPOINTS.author.popular, {
        query: { limit },
      }),
    staleTime: 1000 * 60 * 10,
  });
}