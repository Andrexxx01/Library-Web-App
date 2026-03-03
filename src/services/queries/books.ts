"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Book, BookListData, BookListQueryParams } from "@/types/book";

export const bookKeys = {
  all: ["books"] as const,

  list: (
    params: Required<Pick<BookListQueryParams, "page" | "limit">> &
      Omit<BookListQueryParams, "page" | "limit">,
  ) => ["books", "list", params] as const,

  detail: (bookId: number) => ["books", "detail", bookId] as const,

  search: (q: string, limit: number) =>
    ["books", "search", { q, limit }] as const,

  related: (categoryId: number, page: number, limit: number) =>
    ["books", "related", { categoryId, page, limit }] as const,
};

export type BooksListResponse = ApiResponse<BookListData>;
export type BookDetailResponse = ApiResponse<Book>;

export function getBookById(bookId: number) {
  return api.get<BookDetailResponse>(ENDPOINTS.books.detail(bookId));
}

export function getRelatedBooks(params: {
  categoryId: number;
  page?: number;
  limit?: number;
}) {
  const { categoryId, page = 1, limit = 6 } = params;

  return api.get<BooksListResponse>(ENDPOINTS.books.list, {
    query: {
      categoryId,
      page,
      limit,
    },
  });
}

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
    queryFn: () => getBookById(bookId),
    enabled: Number.isFinite(bookId) && bookId > 0,
  });
}

export function useBookSearchQuery(q: string, limit = 20) {
  const keyword = q.trim();

  return useQuery<BooksListResponse>({
    queryKey: bookKeys.search(keyword, limit),
    enabled: keyword.length > 0,
    queryFn: () =>
      api.get<BooksListResponse>(ENDPOINTS.books.list, {
        query: {
          q: keyword,
          page: 1,
          limit,
        },
      }),
    staleTime: 1000 * 10,
  });
}

/**
 * Related books (bagian ketiga detail page):
 * - categoryId wajib (diambil dari book detail)
 * - default limit 6, page 1
 */
export function useRelatedBooksQuery(categoryId?: number, page = 1, limit = 6) {
  return useQuery<BooksListResponse>({
    queryKey: bookKeys.related(categoryId ?? 0, page, limit),
    enabled: Number.isFinite(categoryId) && (categoryId ?? 0) > 0,
    queryFn: () =>
      getRelatedBooks({
        categoryId: categoryId as number,
        page,
        limit,
      }),
  });
}
