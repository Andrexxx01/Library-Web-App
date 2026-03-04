"use client";

import { useQueries } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Book } from "@/types/book";

type BookDetailResponse = ApiResponse<Book>;

export function useBooksDetailsMapQuery(args: {
  bookIds: number[];
  enabled?: boolean;
}) {
  const enabled = args.enabled ?? true;

  const uniqueIds = Array.from(
    new Set(args.bookIds.filter((id) => Number.isFinite(id) && id > 0)),
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["book", id] as const,
      enabled,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      queryFn: () => api.get<BookDetailResponse>(ENDPOINTS.books.detail(id)),
    })),
  });

  const map = new Map<number, Book>();

  uniqueIds.forEach((id, i) => {
    const q = queries[i];
    const book = q?.data?.data;
    if (book) map.set(id, book);
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  return { map, isLoading, isError };
}
