"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { BookReviewsData } from "@/types/review";

export const reviewKeys = {
  all: ["reviews"] as const,
  byBook: (bookId: number, page: number, limit: number) =>
    ["reviews", "book", bookId, { page, limit }] as const,
};

type BookReviewsResponse = ApiResponse<BookReviewsData>;

export function useBookReviewsQuery(bookId: number, page = 1, limit = 10) {
  return useQuery<BookReviewsResponse>({
    queryKey: reviewKeys.byBook(bookId, page, limit),
    queryFn: () =>
      api.get<BookReviewsResponse>(ENDPOINTS.reviews.listByBook(bookId), {
        query: { page, limit },
      }),
    enabled: Number.isFinite(bookId) && bookId > 0,
  });
}
