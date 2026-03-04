"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { CartData } from "@/types/cart";
import type { Book } from "@/types/book";

export const cartKeys = {
  all: ["cart"] as const,
};

export type CartResponse = ApiResponse<CartData>;

export type AddToCartData = {
  item: {
    id: number;
    cartId: number;
    bookId: number;
    createdAt: string;
    book: Book;
  };
};
export type AddToCartResponse = ApiResponse<AddToCartData>;

export type RemoveFromCartData = { id: number };
export type RemoveFromCartResponse = ApiResponse<RemoveFromCartData>;

function getErrMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

export function useCartQuery(opts?: { enabled?: boolean }) {
  return useQuery<CartResponse>({
    queryKey: cartKeys.all,
    queryFn: () => api.get<CartResponse>(ENDPOINTS.cart.list),
    enabled: opts?.enabled ?? true,
    staleTime: 1000 * 10,
    refetchOnWindowFocus: false,
  });
}

type AddToCartCtx = {
  prev?: CartResponse;
  tempId?: number;
  bookId?: number;
};

type RemoveFromCartCtx = {
  prev?: CartResponse;
};

export function useAddToCartMutation() {
  const qc = useQueryClient();
  return useMutation<
    AddToCartResponse,
    Error,
    { bookId: number },
    AddToCartCtx
  >({
    mutationFn: ({ bookId }) =>
      api.post<AddToCartResponse>(ENDPOINTS.cart.addItem, { bookId }),
    onMutate: async ({ bookId }) => {
      await qc.cancelQueries({ queryKey: cartKeys.all });

      const prev = qc.getQueryData<CartResponse>(cartKeys.all);
      if (!prev?.data) return { prev };

      const already =
        prev.data.items?.some((it) => it.bookId === bookId) ?? false;
      if (already) return { prev, bookId };

      const tempId = -Date.now();
      qc.setQueryData<CartResponse>(cartKeys.all, {
        ...prev,
        data: {
          ...prev.data,
          items: [
            ...(prev.data.items ?? []),
            {
              id: tempId,
              bookId,
              addedAt: new Date().toISOString(),
              book: {
                id: bookId,
                title: "Loading...",
                description: "",
                isbn: "",
                publishedYear: new Date().getFullYear(),
                coverImage: null,
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
              } as Book,
            } as any,
          ],
          itemCount: (prev.data.itemCount ?? prev.data.items?.length ?? 0) + 1,
        },
      });

      return { prev, tempId, bookId };
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<CartResponse>(cartKeys.all, ctx.prev);
      console.error("[addToCart] error:", getErrMessage(err));
    },

    onSuccess: (res, _vars, ctx) => {
      const current = qc.getQueryData<CartResponse>(cartKeys.all);
      if (!current?.data) return;
      const serverItem = res?.data?.item;
      if (!serverItem) {
        qc.invalidateQueries({ queryKey: cartKeys.all });
        return;
      }

      const tempId = ctx?.tempId;
      const items = current.data.items ?? [];
      const nextItems = items.map((it: any) => {
        if (tempId && it?.id === tempId) {
          return {
            id: serverItem.id,
            bookId: serverItem.bookId,
            addedAt: serverItem.createdAt ?? new Date().toISOString(),
            book: serverItem.book,
          };
        }
        return it;
      });

      qc.setQueryData<CartResponse>(cartKeys.all, {
        ...current,
        data: {
          ...current.data,
          items: nextItems,
          itemCount: nextItems.length,
        },
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function useRemoveFromCartMutation() {
  const qc = useQueryClient();
  return useMutation<
    RemoveFromCartResponse,
    Error,
    { itemId: number },
    RemoveFromCartCtx
  >({
    mutationFn: ({ itemId }) =>
      api.delete<RemoveFromCartResponse>(ENDPOINTS.cart.deleteItem(itemId)),
    onMutate: async ({ itemId }) => {
      await qc.cancelQueries({ queryKey: cartKeys.all });

      const prev = qc.getQueryData<CartResponse>(cartKeys.all);
      if (!prev?.data) return { prev };

      const beforeItems = prev.data.items ?? [];
      const nextItems = beforeItems.filter((it) => it.id !== itemId);

      qc.setQueryData<CartResponse>(cartKeys.all, {
        ...prev,
        data: {
          ...prev.data,
          items: nextItems,
          itemCount: nextItems.length,
        },
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<CartResponse>(cartKeys.all, ctx.prev);
      console.error("[removeFromCart] error:", getErrMessage(err));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

export function getCartItemIdByBookId(
  cart: CartResponse | undefined,
  bookId: number,
) {
  const items = cart?.data?.items ?? [];
  const found = items.find((it) => it.bookId === bookId);
  return found?.id;
}
