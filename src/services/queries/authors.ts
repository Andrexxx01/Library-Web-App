"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Book } from "@/types/book";
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

export type AuthorBooksQueryParams = {
  authorId: number;
  page?: number;
  limit?: number;
};

export type AuthorBooksData = {
  author: Pick<Author, "id" | "name" | "bio">;
  bookCount: number;
  books: Book[];
};

export type AuthorBooksResponse = ApiResponse<AuthorBooksData>;

export const authorKeys = {
  all: ["authors"] as const,
  list: (params?: AuthorsQueryParams) =>
    ["authors", "list", params ?? {}] as const,
  popular: (limit: number) => ["authors", "popular", limit] as const,

  booksByAuthor: (authorId: number, page: number, limit: number) =>
    ["authors", "books", { authorId, page, limit }] as const,
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

export function useAuthorBooksQuery(params: AuthorBooksQueryParams) {
  const authorId = params.authorId;
  const page = params.page ?? 1;
  const limit = params.limit ?? 8;

  return useQuery<AuthorBooksResponse>({
    queryKey: authorKeys.booksByAuthor(authorId, page, limit),
    enabled: Number.isFinite(authorId) && authorId > 0,
    queryFn: () =>
      api.get<AuthorBooksResponse>(ENDPOINTS.author.bookFilter(authorId), {
        query: { page, limit },
      }),
    staleTime: 1000 * 30,
  });
}
