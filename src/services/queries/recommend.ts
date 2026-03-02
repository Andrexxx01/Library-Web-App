"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

import type { ApiResponse } from "@/types/api";
import type {
  RecommendBooksData,
  RecommendBooksParams,
} from "@/types/recommend";

export const recommendKeys = {
  all: ["books", "recommend"] as const,
  list: (
    params: Required<Pick<RecommendBooksParams, "by" | "page" | "limit">>,
  ) => ["books", "recommend", params] as const,
};

type RecommendResponse = ApiResponse<RecommendBooksData>;

export function useRecommendBooksQuery(params: RecommendBooksParams) {
  const by = params.by ?? "popular";
  const page = params.page ?? 1;
  const limit = params.limit ?? 30;

  return useQuery<RecommendResponse>({
    queryKey: recommendKeys.list({ by, page, limit }),
    queryFn: () =>
      api.get<RecommendResponse>(ENDPOINTS.books.recommend, {
        query: { by, page, limit },
      }),
    staleTime: 1000 * 10,
  });
}
