"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import HeaderContainer from "@/components/layout/headerContainer";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useCartQuery } from "@/services/queries/cart";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleAll, toggleItem, syncSelectedWithCart } from "@/store/cartSlice";
import { setCheckoutGate } from "@/lib/checkoutGate";

function CartCheckbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "h-5 w-5 rounded-md border transition flex items-center justify-center",
        checked
          ? "border-[#2563EB] bg-[#2563EB]"
          : "border-neutral-300 bg-white",
      ].join(" ")}
    >
      {checked ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  );
}

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedItemIds = useAppSelector((s) => s.cart.selectedItemIds);

  const { data, isLoading, isError, error, refetch } = useCartQuery({
    enabled: true,
  });

  const items = data?.data?.items ?? [];
  const itemIds = useMemo(() => items.map((it) => it.id), [items]);
  const itemIdsKey = useMemo(() => itemIds.join("|"), [itemIds]);

  useEffect(() => {
    dispatch(syncSelectedWithCart({ existingIds: itemIds }));
  }, [dispatch, itemIdsKey]);

  const selectedCount = useMemo(() => {
    const set = new Set(itemIds);
    return selectedItemIds.filter((id) => set.has(id)).length;
  }, [selectedItemIds, itemIds]);

  const allSelected = itemIds.length > 0 && selectedCount === itemIds.length;

  function handleBorrow() {
    if (selectedCount < 1) return;
    setCheckoutGate({ mode: "cart", at: Date.now() });
    router.push("/checkout?mode=cart");
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-white">
        <HeaderContainer />
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-20 md:px-6">
          <div className="h-9 w-44 animate-pulse rounded bg-neutral-200" />
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              </div>
              <div className="mt-6 space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border-b border-neutral-200 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 h-5 w-5 animate-pulse rounded bg-neutral-200" />
                      <div className="h-16 w-12 animate-pulse rounded bg-neutral-200" />
                      <div className="flex-1">
                        <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
                        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-neutral-200" />
                        <div className="mt-2 h-4 w-28 animate-pulse rounded bg-neutral-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* RIGHT (desktop summary card skeleton) */}
            <div className="hidden md:block">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0px_10px_22px_rgba(0,0,0,0.06)]">
                <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
                <div className="mt-6 flex items-center justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
                </div>
                <div className="mt-6 h-11 w-full animate-pulse rounded-full bg-neutral-200" />
              </div>
            </div>
          </div>
          <div className="mt-10 h-px w-full bg-neutral-200" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-dvh bg-white">
        <HeaderContainer />
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-20 md:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load cart.
            <div className="mt-2 opacity-80">
              {(error as any)?.message
                ? String((error as any).message)
                : "Unknown error"}
            </div>
            <Button
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <HeaderContainer />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 md:px-6 md:pb-10">
        <h1 className="text-3xl font-bold text-neutral-900">My Cart</h1>
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div>
            {/* Select All */}
            <div className="flex items-center gap-3">
              <CartCheckbox
                checked={allSelected}
                onChange={() => dispatch(toggleAll({ allIds: itemIds }))}
                ariaLabel="Select all"
              />
              <p className="text-sm text-neutral-900">Select All</p>
            </div>
            {/* List */}
            <div className="mt-6">
              {items.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-600">
                  Cart is empty.
                </div>
              ) : (
                <div>
                  {items.map((it, idx) => {
                    const checked = selectedItemIds.includes(it.id);
                    const isLast = idx === items.length - 1;
                    return (
                      <div
                        key={it.id}
                        className={[
                          "py-6",
                          !isLast ? "border-b border-neutral-200" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            <CartCheckbox
                              checked={checked}
                              onChange={() => dispatch(toggleItem(it.id))}
                              ariaLabel={`Select cart item ${it.id}`}
                            />
                          </div>
                          {/* Cover */}
                          <motion.button
                            type="button"
                            onClick={() => router.push(`/books/${it.book.id}`)}
                            className="relative h-16 w-12 overflow-hidden rounded-md bg-neutral-100"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            aria-label="Open book detail"
                          >
                            {it.book.coverImage ? (
                              it.book.coverImage.startsWith("/") ? (
                                <Image
                                  src={it.book.coverImage}
                                  alt={it.book.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <img
                                  src={it.book.coverImage}
                                  alt={it.book.title}
                                  className="h-full w-full object-cover"
                                />
                              )
                            ) : null}
                          </motion.button>
                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <span className="inline-flex rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-900">
                              {it.book.category?.name ?? "Category"}
                            </span>
                            <p className="mt-2 line-clamp-1 text-base font-semibold text-neutral-900">
                              {it.book.title}
                            </p>
                            <p className="mt-1 text-sm text-neutral-600">
                              {it.book.author?.name ?? "Author name"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {/* RIGHT (desktop summary) */}
          <div className="hidden md:block">
            <div className="rounded-2xl bg-white p-6 shadow-[0px_10px_22px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
              <h3 className="text-base font-semibold text-neutral-900">
                Loan Summary
              </h3>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-neutral-600">Total Book</span>
                <span className="font-semibold text-neutral-900">
                  {selectedCount} Items
                </span>
              </div>
              <motion.div
                whileHover={{ scale: selectedCount > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedCount > 0 ? 0.98 : 1 }}
              >
                <Button
                  className="mt-6 h-11 w-full rounded-full"
                  disabled={selectedCount < 1}
                  onClick={handleBorrow}
                >
                  Borrow Book
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-neutral-200" />
      </main>
      {/* Mobile floating footer */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-600">Total Book</p>
            <p className="text-sm font-semibold text-neutral-900">
              {selectedCount} Items
            </p>
          </div>
          <motion.div
            whileHover={{ scale: selectedCount > 0 ? 1.02 : 1 }}
            whileTap={{ scale: selectedCount > 0 ? 0.98 : 1 }}
            className="flex-1"
          >
            <Button
              className="h-11 w-full rounded-full"
              disabled={selectedCount < 1}
              onClick={handleBorrow}
            >
              Borrow Book
            </Button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
