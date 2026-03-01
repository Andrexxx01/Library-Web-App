"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Book } from "@/types/book";
import type { BookListData, BookListQueryParams } from "@/types/books";

export const bookKeys = {
  all: ["books"] as const,
  list: (
    params: Required<Pick<BookListQueryParams, "page" | "limit">> &
      Omit<BookListQueryParams, "page" | "limit">,
  ) => ["books", "list", params] as const,
  detail: (bookId: number) => ["books", "detail", bookId] as const,
};

type BooksListResponse = ApiResponse<BookListData>;
type BookDetailResponse = ApiResponse<Book>;

export function useBooksQuery(params: BookListQueryParams) {
  const { q, categoryId, authorId, minRating, page = 1, limit = 12 } = params;

  const normalizedQ = q?.trim() ? q.trim() : undefined;

  return useQuery<BooksListResponse>({
    queryKey: bookKeys.list({
      q: normalizedQ,
      categoryId,
      authorId,
      minRating,
      page,
      limit,
    }),
    queryFn: () =>
      api.get<BooksListResponse>(ENDPOINTS.books.list, {
        query: {
          q: normalizedQ,
          categoryId,
          authorId,
          minRating,
          page,
          limit,
        },
      }),
  });
}

export function useBookDetailQuery(bookId: number) {
  return useQuery<BookDetailResponse>({
    queryKey: bookKeys.detail(bookId),
    queryFn: () => api.get<BookDetailResponse>(ENDPOINTS.books.detail(bookId)),
    enabled: Number.isFinite(bookId) && bookId > 0,
  });
}
