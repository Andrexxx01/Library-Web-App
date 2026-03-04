"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { LoansDataRaw, LoansData, Loan, LoanRaw } from "@/types/loan";
import type { MyReviewsData } from "@/types/review";
import type { Book } from "@/types/book";

export const loansKeys = {
  all: ["me", "loans"] as const,
  list: (params: { q: string; filter: string }) =>
    ["me", "loans", params] as const,
};

export const myReviewsKeys = {
  all: ["me", "reviews"] as const,
};

export function pickErrMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

function calcDurationDays(borrowedAt: string, dueAt: string): number {
  const a = new Date(borrowedAt).getTime();
  const b = new Date(dueAt).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

async function fetchBookDetail(bookId: number): Promise<Book> {
  const path =
    (ENDPOINTS as any)?.books?.detail?.(bookId) ?? `/api/books/${bookId}`;

  const res = await api.get<ApiResponse<Book>>(path);
  return res.data;
}

async function enrichLoans(rawLoans: LoanRaw[]): Promise<Loan[]> {
  const uniqueIds = Array.from(new Set(rawLoans.map((l) => l.bookId)));
  const books = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const b = await fetchBookDetail(id);
        return [id, b] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );

  const map = new Map<number, Book | null>(books);

  return rawLoans.map((l) => {
    const detail = map.get(l.bookId);
    // fallback kalau detail gagal: minimal book
    const fallback: Book = {
      id: l.book.id,
      title: l.book.title,
      description: "",
      isbn: "",
      publishedYear: new Date().getFullYear(),
      coverImage: l.book.coverImage,
      rating: 0,
      reviewCount: 0,
      totalCopies: 0,
      availableCopies: 0,
      borrowCount: 0,
      authorId: 0,
      categoryId: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { id: 0, name: "—" } as any,
      category: { id: 0, name: "—" } as any,
    } as any;

    return {
      ...l,
      book: detail ?? fallback,
    };
  });
}

export function useMyLoansInfiniteQuery(opts: {
  enabled: boolean;
  limit?: number;
}) {
  const limit = opts.limit ?? 20;

  return useInfiniteQuery<ApiResponse<LoansData>, Error>({
    queryKey: loansKeys.all,
    enabled: opts.enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = Number(pageParam ?? 1);

      const raw = await api.get<ApiResponse<LoansDataRaw>>(
        `/api/me/loans?page=${page}&limit=${limit}`,
      );

      const enrichedLoans = await enrichLoans(raw.data.loans);

      return {
        ...raw,
        data: {
          loans: enrichedLoans,
          pagination: raw.data.pagination,
        },
      };
    },
    getNextPageParam: (lastPage) => {
      const p = lastPage.data.pagination;
      if (p.page < p.totalPages) return p.page + 1;
      return undefined;
    },
    staleTime: 1000 * 15,
    refetchOnWindowFocus: false,
  });
}

export function useMyReviewsQuery(opts: { enabled: boolean }) {
  return useQuery<ApiResponse<MyReviewsData>, Error>({
    queryKey: myReviewsKeys.all,
    enabled: opts.enabled,
    queryFn: () =>
      api.get<ApiResponse<MyReviewsData>>(`/api/me/reviews?page=1&limit=20`),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useReturnLoanMutation() {
  const qc = useQueryClient();

  return useMutation<
    ApiResponse<{
      loan: {
        id: number;
        status: "RETURNED" | "LATE";
        returnedAt: string | null;
        dueAt: string;
        borrowedAt: string;
        bookId: number;
      };
    }>,
    Error,
    { loanId: number },
    { prev?: any }
  >({
    mutationFn: ({ loanId }) =>
      api.patch<ApiResponse<{ loan: any }>>(`/api/loans/${loanId}/return`, {}),

    onMutate: async ({ loanId }) => {
      await qc.cancelQueries({ queryKey: loansKeys.all });

      const prev = qc.getQueryData(loansKeys.all);

      qc.setQueriesData({ queryKey: loansKeys.all }, (old: any) => {
        if (!old?.pages) return old;

        const nextPages = old.pages.map((pg: ApiResponse<LoansData>) => {
          const nextLoans = pg.data.loans.map((l) => {
            if (l.id !== loanId) return l;
            return {
              ...l,
              status: "RETURNED",
              returnedAt: new Date().toISOString(),
            };
          });
          return { ...pg, data: { ...pg.data, loans: nextLoans } };
        });
        return { ...old, pages: nextPages };
      });
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(loansKeys.all, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: loansKeys.all });
    },
  });
}

export function useDeleteReviewMutation() {
  const qc = useQueryClient();

  return useMutation<
    ApiResponse<{ id: number }>,
    Error,
    { reviewId: number },
    { prev?: ApiResponse<MyReviewsData> }
  >({
    mutationFn: ({ reviewId }) =>
      api.delete<ApiResponse<{ id: number }>>(`/api/reviews/${reviewId}`),

    onMutate: async ({ reviewId }) => {
      await qc.cancelQueries({ queryKey: myReviewsKeys.all });

      const prev = qc.getQueryData<ApiResponse<MyReviewsData>>(
        myReviewsKeys.all,
      );

      if (prev?.data?.reviews) {
        qc.setQueryData<ApiResponse<MyReviewsData>>(myReviewsKeys.all, {
          ...prev,
          data: {
            ...prev.data,
            reviews: prev.data.reviews.filter((r) => r.id !== reviewId),
          },
        });
      }

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(myReviewsKeys.all, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: myReviewsKeys.all });
    },
  });
}

export function getMyReviewByBookId(
  reviews: ApiResponse<MyReviewsData> | undefined,
  bookId: number,
) {
  const list = reviews?.data?.reviews ?? [];
  return list.find((r) => r.book?.id === bookId);
}

export function getLoanDurationDays(loan: {
  borrowedAt: string;
  dueAt: string;
}) {
  return calcDurationDays(loan.borrowedAt, loan.dueAt);
}
