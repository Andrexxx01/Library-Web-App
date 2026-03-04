"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import HeaderContainer from "@/components/layout/headerContainer";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { readCheckoutGate, clearCheckoutGate } from "@/lib/checkoutGate";
import {
  pickErrMessage,
  useCartCheckoutQuery,
  useLoanDirectMutation,
  useLoansFromCartMutation,
  useMeQuery,
  useRemoveCartItemMutation,
} from "@/services/queries/checkout";
import type { BookDetailResponse } from "@/services/queries/books";
import { getBookById } from "@/services/queries/books";

type Mode = "cart" | "direct";
type DurationDays = 3 | 5 | 10;

function formatPretty(date: Date) {
  return dayjs(date).format("D MMM YYYY");
}

function toYMD(date: Date) {
  return dayjs(date).format("YYYY-MM-DD");
}

function BlueCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 text-left"
    >
      <span
        className={[
          "mt-0.5 h-5 w-5 rounded-[6px] border flex items-center justify-center transition",
          checked
            ? "bg-[#1E64E0] border-[#1E64E0]"
            : "bg-white border-neutral-300",
        ].join(" ")}
        aria-hidden="true"
      >
        {checked ? <span className="text-[12px] text-white">✓</span> : null}
      </span>
      <span className="text-sm text-neutral-800">{label}</span>
    </button>
  );
}

function RadioRow({
  value,
  active,
  onClick,
  label,
}: {
  value: DurationDays;
  active: boolean;
  onClick: (v: DurationDays) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className="flex items-center gap-3"
    >
      <span
        className={[
          "h-5 w-5 rounded-full border flex items-center justify-center",
          active ? "border-[#1E64E0]" : "border-neutral-300",
        ].join(" ")}
      >
        {active ? <span className="h-3 w-3 rounded-full bg-[#1E64E0]" /> : null}
      </span>
      <span className="text-sm text-neutral-900">{label}</span>
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const mode = (sp.get("mode") as Mode | null) ?? null;
  const directBookId = Number(sp.get("bookId") ?? "");
  const { token, user } = useAppSelector((s) => s.auth);
  const authed = !!token && !!user;
  const selectedItemIds = useAppSelector((s) => s.cart.selectedItemIds);

  useEffect(() => {
    if (!authed) {
      router.replace("/login");
      return;
    }

    const gate = readCheckoutGate();
    if (!gate) {
      router.replace("/");
      return;
    }

    if (mode !== "cart" && mode !== "direct") {
      router.replace("/");
      return;
    }

    if (mode === "direct") {
      if (!Number.isFinite(directBookId) || directBookId <= 0) {
        router.replace("/");
        return;
      }
    }

    if (mode === "cart") {
      if (!selectedItemIds || selectedItemIds.length < 1) {
        router.replace("/cart");
        return;
      }
    }
  }, [authed, mode, directBookId, selectedItemIds, router]);

  const isDirect = mode === "direct";
  const meQuery = useMeQuery({ enabled: authed });
  const cartCheckoutQuery = useCartCheckoutQuery({
    enabled: authed && mode === "cart",
  });

  const directBookQuery = useQuery<BookDetailResponse>({
    queryKey: ["book", directBookId],
    queryFn: () => getBookById(directBookId),
    enabled:
      authed &&
      mode === "direct" &&
      Number.isFinite(directBookId) &&
      directBookId > 0,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const [borrowDate, setBorrowDate] = useState<Date>(() => new Date());
  const [days, setDays] = useState<DurationDays>(3);

  useEffect(() => {
    if (isDirect) setBorrowDate(new Date());
  }, [isDirect]);

  const returnDate = useMemo(() => {
    return dayjs(borrowDate).add(days, "day").toDate();
  }, [borrowDate, days]);

  const [agreeReturnBeforeDue, setAgreeReturnBeforeDue] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);

  const dateInputRef = useRef<HTMLInputElement | null>(null);
  function openCalendar() {
    if (isDirect) return;
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click();
  }

  const bookList = useMemo(() => {
    if (mode === "direct") {
      const b = directBookQuery.data?.data;
      if (!b) return [];
      return [{ id: -1, bookId: directBookId, book: b }];
    }

    const all = cartCheckoutQuery.data?.data?.items ?? [];
    const set = new Set(selectedItemIds);
    return all.filter((it) => set.has(it.id));
  }, [
    mode,
    directBookQuery.data,
    directBookId,
    cartCheckoutQuery.data,
    selectedItemIds,
  ]);

  const removeCartItemMut = useRemoveCartItemMutation();
  const cleanedRef = useRef(false);

  useEffect(() => {
    if (mode !== "cart") return;
    if (cleanedRef.current) return;

    const all = cartCheckoutQuery.data?.data?.items ?? [];
    if (all.length === 0) return;

    const selectedSet = new Set(selectedItemIds);
    if (selectedSet.size < 1) return;

    const unselected = all.filter((it) => !selectedSet.has(it.id));
    if (unselected.length === 0) {
      cleanedRef.current = true;
      return;
    }

    cleanedRef.current = true;

    Promise.allSettled(
      unselected.map((it) => removeCartItemMut.mutateAsync({ itemId: it.id })),
    ).catch(() => {});
  }, [mode, cartCheckoutQuery.data, selectedItemIds, removeCartItemMut]);

  const fromCartMut = useLoansFromCartMutation();
  const directMut = useLoanDirectMutation();
  const [successOpen, setSuccessOpen] = useState(false);
  const [successDueText, setSuccessDueText] = useState<string>("");
  const isConfirmLoading = fromCartMut.isPending || directMut.isPending;

  const canConfirm =
    bookList.length > 0 &&
    agreeReturnBeforeDue &&
    agreePolicy &&
    !isConfirmLoading;

  async function handleConfirm() {
    if (!canConfirm) return;
    try {
      if (mode === "cart") {
        const payload = {
          itemIds: bookList.map((it) => it.id),
          durationDays: days,
          borrowDate: toYMD(borrowDate),
        };
        const res: any = await fromCartMut.mutateAsync(payload);
        const loans = res?.data?.loans ?? [];
        if (!Array.isArray(loans) || loans.length === 0) {
          const msg =
            res?.data?.message ||
            res?.message ||
            "Tidak ada buku yang berhasil dipinjam.";
          throw new Error(String(msg));
        }
        setSuccessDueText(formatPretty(returnDate));
        setSuccessOpen(true);
        clearCheckoutGate();
        return;
      }

      const res: any = await directMut.mutateAsync({
        bookId: directBookId,
        durationDays: days,
      });

      const dueAt = res?.data?.loan?.dueAt;
      const dueText = dueAt
        ? formatPretty(new Date(dueAt))
        : formatPretty(returnDate);

      setSuccessDueText(dueText);
      setSuccessOpen(true);
      clearCheckoutGate();
    } catch (err) {
      alert(pickErrMessage(err));
    }
  }

  function goBorrowedList() {
    setSuccessOpen(false);
    router.replace("/my-loans");
  }

  const profile = meQuery.data?.data?.profile;

  const listLoading =
    mode === "cart" ? cartCheckoutQuery.isLoading : directBookQuery.isLoading;

  const listError =
    mode === "cart" ? cartCheckoutQuery.isError : directBookQuery.isError;

  const listErrorMsg =
    mode === "cart"
      ? pickErrMessage(cartCheckoutQuery.error)
      : pickErrMessage(directBookQuery.error);

  return (
    <div className="min-h-dvh bg-white">
      <HeaderContainer />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 md:px-6 md:pb-10">
        <h1 className="text-[32px] font-bold text-neutral-900">Checkout</h1>
        {/* Error states */}
        {meQuery.isError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load user information.
            <div className="mt-2 opacity-80">
              {pickErrMessage(meQuery.error)}
            </div>
            <Button
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() => meQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : null}
        {listError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load checkout items.
            <div className="mt-2 opacity-80">{listErrorMsg}</div>
            <Button
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() =>
                mode === "cart"
                  ? cartCheckoutQuery.refetch()
                  : directBookQuery.refetch()
              }
            >
              Retry
            </Button>
          </div>
        ) : null}
        {/* Layout */}
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_480px] md:items-start">
          {/* LEFT */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              User Information
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-neutral-600">Name</div>
              <div className="text-right font-semibold text-neutral-900">
                {meQuery.isLoading ? (
                  <span className="inline-block h-4 w-28 animate-pulse rounded bg-neutral-200" />
                ) : (
                  (profile?.name ?? "—")
                )}
              </div>
              <div className="text-neutral-600">Email</div>
              <div className="text-right font-semibold text-neutral-900">
                {meQuery.isLoading ? (
                  <span className="inline-block h-4 w-44 animate-pulse rounded bg-neutral-200" />
                ) : (
                  (profile?.email ?? "—")
                )}
              </div>
              <div className="text-neutral-600">Nomor Handphone</div>
              <div className="text-right font-semibold text-neutral-900">
                {meQuery.isLoading ? (
                  <span className="inline-block h-4 w-36 animate-pulse rounded bg-neutral-200" />
                ) : (
                  (profile?.phone ?? "—")
                )}
              </div>
            </div>
            <div className="mt-6 h-px w-full bg-neutral-200" />
            <h2 className="mt-8 text-2xl font-bold text-neutral-900">
              Book List
            </h2>
            <div className="mt-5 space-y-6">
              {listLoading ? (
                <>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-20 w-16 animate-pulse rounded-md bg-neutral-200" />
                      <div className="flex-1">
                        <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
                        <div className="mt-2 h-5 w-56 animate-pulse rounded bg-neutral-200" />
                        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-neutral-200" />
                      </div>
                    </div>
                  ))}
                </>
              ) : bookList.length === 0 ? (
                <div className="text-sm text-neutral-600">
                  No selected items.
                </div>
              ) : (
                bookList.map((it) => {
                  const b = it.book;
                  const cover = b?.coverImage;
                  return (
                    <div key={it.id} className="flex items-center gap-4">
                      <div className="h-20 w-16 overflow-hidden rounded-md bg-neutral-100">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt={b.title}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-900">
                          {b.category?.name ?? "Category"}
                        </span>
                        <p className="mt-2 line-clamp-1 text-base font-bold text-neutral-900">
                          {b.title ?? "Book Name"}
                        </p>
                        <p className="mt-1 text-sm text-neutral-600">
                          {b.author?.name ?? "Author name"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {/* RIGHT */}
          <div>
            <div className="rounded-2xl bg-white p-6 shadow-[0px_10px_22px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
              <h3 className="text-2xl font-bold text-neutral-900">
                Complete Your Borrow Request
              </h3>
              <div className="mt-6">
                <p className="text-sm font-semibold text-neutral-900">
                  Borrow Date
                </p>
                <div className="mt-3 relative">
                  <input
                    readOnly
                    value={formatPretty(borrowDate)}
                    className={[
                      "h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm text-neutral-900 outline-none",
                      isDirect
                        ? "border-neutral-200 bg-neutral-50"
                        : "border-neutral-300",
                    ].join(" ")}
                  />
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="sr-only"
                    value={toYMD(borrowDate)}
                    onChange={(e) => {
                      const next = dayjs(e.target.value).toDate();
                      if (Number.isFinite(next.getTime())) setBorrowDate(next);
                    }}
                    disabled={isDirect}
                  />
                  <button
                    type="button"
                    onClick={openCalendar}
                    disabled={isDirect}
                    className={[
                      "absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg",
                      isDirect
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-neutral-100",
                    ].join(" ")}
                    aria-label="Open calendar"
                  >
                    <Image
                      src="/calendar.svg"
                      alt="calendar"
                      width={18}
                      height={18}
                    />
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-neutral-900">
                  Borrow Duration
                </p>
                <div className="mt-4 space-y-4">
                  <RadioRow
                    value={3}
                    active={days === 3}
                    onClick={setDays}
                    label="3 Days"
                  />
                  <RadioRow
                    value={5}
                    active={days === 5}
                    onClick={setDays}
                    label="5 Days"
                  />
                  <RadioRow
                    value={10}
                    active={days === 10}
                    onClick={setDays}
                    label="10 Days"
                  />
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-[#F5F8FF] p-5">
                <p className="text-sm font-bold text-neutral-900">
                  Return Date
                </p>
                <p className="mt-2 text-sm text-neutral-700">
                  Please return the book no later than{" "}
                  <span className="font-semibold text-[#FF2D55]">
                    {formatPretty(returnDate)}
                  </span>
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <BlueCheckbox
                  checked={agreeReturnBeforeDue}
                  onChange={setAgreeReturnBeforeDue}
                  label="I agree to return the book(s) before the due date."
                />
                <BlueCheckbox
                  checked={agreePolicy}
                  onChange={setAgreePolicy}
                  label="I accept the library borrowing policy."
                />
              </div>
              <motion.div
                whileHover={{ scale: canConfirm ? 1.02 : 1 }}
                whileTap={{ scale: canConfirm ? 0.98 : 1 }}
                className="mt-6"
              >
                <Button
                  className="h-12 w-full rounded-full"
                  disabled={!canConfirm}
                  onClick={handleConfirm}
                >
                  {isConfirmLoading ? "Processing..." : "Confirm & Borrow"}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-neutral-200" />
      </main>
      <Footer />
      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {successOpen ? (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-999 bg-white"
          >
            <div className="flex min-h-dvh items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="w-full max-w-2xl text-center"
              >
                <div className="mx-auto flex h-26 w-26 items-center justify-center">
                  <Image
                    src="/success.svg"
                    alt="Success"
                    width={110}
                    height={110}
                    priority
                  />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-neutral-900 md:text-4xl">
                  Borrowing Successful!
                </h2>
                <p className="mt-3 text-sm text-neutral-700 md:text-base">
                  Your book has been successfully borrowed. Please return it by{" "}
                  <span className="font-semibold text-[#FF2D55]">
                    {successDueText}
                  </span>
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8"
                >
                  <Button
                    className="h-12 w-full max-w-sm rounded-full"
                    onClick={() => {
                      setSuccessOpen(false);
                      router.replace("/myLoan");
                    }}
                  >
                    See Borrowed List
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
