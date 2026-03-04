"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import HeaderContainer from "@/components/layout/headerContainer";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import LoanCard from "@/components/common/loanCard";
import { useAppSelector } from "@/store/hooks";
import {
  pickErrMessage,
  useMyLoansInfiniteQuery,
  useMyReviewsQuery,
  useReturnLoanMutation,
  useDeleteReviewMutation,
  getMyReviewByBookId,
} from "@/services/queries/loans";
import type { Loan, LoanStatus } from "@/types/loan";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useBooksDetailsMapQuery } from "@/services/queries/booksLite";

type Filter = "all" | "active" | "returned" | "overdue";

function mapFilterToStatus(filter: Filter): LoanStatus | null {
  if (filter === "active") return "BORROWED";
  if (filter === "returned") return "RETURNED";
  if (filter === "overdue") return "LATE";
  return null;
}

function formatPrettyDate(iso: string) {
  return dayjs(iso).format("D MMMM YYYY");
}

export default function MyLoanPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAppSelector((s) => s.auth);
  const authed = isAuthenticated && !!token && !!user;
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewBookTitle, setReviewBookTitle] = useState<string>("");
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const loansInf = useMyLoansInfiniteQuery({ enabled: authed, limit: 20 });
  const reviewsQ = useMyReviewsQuery({ enabled: authed });
  const returnMut = useReturnLoanMutation();
  const deleteReviewMut = useDeleteReviewMutation();

  const allLoans: Loan[] = useMemo(() => {
    const pages = loansInf.data?.pages ?? [];
    return pages.flatMap((p) => p.data.loans ?? []);
  }, [loansInf.data]);

  const filteredLoans = useMemo(() => {
    const status = mapFilterToStatus(filter);
    let list = allLoans;

    if (status) list = list.filter((l) => l.status === status);

    const q = search.trim().toLowerCase();
    if (q.length > 0) {
      list = list.filter((l) =>
        (l.book?.title ?? "").toLowerCase().includes(q),
      );
    }

    return list;
  }, [allLoans, filter, search]);

  const visibleBookIds = useMemo(
    () => filteredLoans.map((l) => l.bookId),
    [filteredLoans],
  );

  const booksMapQ = useBooksDetailsMapQuery({
    bookIds: visibleBookIds,
    enabled: authed && !loansInf.isLoading,
  });

  const topTabs = [
    { label: "Profile", href: "/profile" },
    { label: "Borrowed List", href: "/myLoan" },
    { label: "Reviews", href: "/reviews" },
  ] as const;

  function openGiveReviewPopup(title: string) {
    setReviewBookTitle(title);
    setReviewStars(5);
    setReviewComment("");
    setReviewOpen(true);
  }

  function submitReviewMock() {
    toast.success("Review popup ready (API submit menyusul).");
    setReviewOpen(false);
  }

  if (!authed) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-dvh bg-white">
      <HeaderContainer />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 md:px-6 md:pb-10">
        {/* top tabs */}
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-[#F3F3F3] p-2">
          <div className="grid grid-cols-3 gap-2">
            {topTabs.map((t) => {
              const active = t.href === "/myLoan";
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => router.push(t.href)}
                  className={[
                    "h-11 rounded-xl text-sm font-semibold transition",
                    active
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-800",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mx-auto mt-8 w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-neutral-900">Borrowed List</h1>
          {/* search */}
          <div className="relative mt-5">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2">
              <Image src="/Search.svg" alt="Search" width={18} height={18} />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search book"
              className="h-12 w-full rounded-full border border-neutral-300 bg-white pl-12 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-300"
            />
          </div>
          {/* filter tabs */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { k: "all", label: "All" },
              { k: "active", label: "Active" },
              { k: "returned", label: "Returned" },
              { k: "overdue", label: "Overdue" },
            ].map((t) => {
              const active = filter === (t.k as Filter);
              return (
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setFilter(t.k as Filter)}
                  className={[
                    "h-10 rounded-full border px-5 text-sm font-semibold transition",
                    active
                      ? "border-[#1E64E0] text-[#1E64E0]"
                      : "border-neutral-300 text-neutral-800 hover:border-neutral-400",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          {/* error states */}
          {loansInf.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load loans.
              <div className="mt-2 opacity-80">
                {pickErrMessage(loansInf.error)}
              </div>
              <Button
                variant="outline"
                className="mt-3 rounded-full"
                onClick={() => loansInf.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}
          {reviewsQ.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load reviews.
              <div className="mt-2 opacity-80">
                {pickErrMessage(reviewsQ.error)}
              </div>
              <Button
                variant="outline"
                className="mt-3 rounded-full"
                onClick={() => reviewsQ.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}
          {/* list */}
          <div className="mt-6 space-y-6">
            {loansInf.isLoading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white p-5 shadow-[0px_10px_22px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
                      <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
                    </div>
                    <div className="mt-4 h-px w-full bg-neutral-200" />
                    <div className="mt-5 flex gap-4">
                      <div className="h-24 w-20 animate-pulse rounded bg-neutral-200" />
                      <div className="flex-1">
                        <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
                        <div className="mt-3 h-5 w-72 animate-pulse rounded bg-neutral-200" />
                        <div className="mt-2 h-4 w-44 animate-pulse rounded bg-neutral-200" />
                        <div className="mt-4 h-5 w-56 animate-pulse rounded bg-neutral-200" />
                      </div>
                    </div>
                    <div className="mt-5 h-11 w-44 animate-pulse rounded-full bg-neutral-200 md:ml-auto" />
                  </div>
                ))}
              </>
            ) : filteredLoans.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-600">
                No loans found.
              </div>
            ) : (
              filteredLoans.map((loan) => {
                const review = getMyReviewByBookId(reviewsQ.data, loan.bookId);
                const reviewed = !!review;
                const dueText = formatPrettyDate(loan.dueAt);
                const bookDetail = booksMapQ.map.get(loan.bookId);
                const categoryName = bookDetail?.category?.name ?? null;
                const authorName = bookDetail?.author?.name ?? null;
                return (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    reviewed={reviewed}
                    dueDateText={dueText}
                    categoryName={categoryName}
                    authorName={authorName}
                    loadingReturn={returnMut.isPending}
                    loadingDelete={deleteReviewMut.isPending}
                    onReturn={() => returnMut.mutate({ loanId: loan.id })}
                    onGiveReview={() => openGiveReviewPopup(loan.book.title)}
                    onDeleteReview={() => {
                      if (!review) return;
                      deleteReviewMut.mutate({ reviewId: review.id });
                    }}
                  />
                );
              })
            )}
          </div>
          {/* load more */}
          {!loansInf.isLoading && loansInf.hasNextPage ? (
            <div className="mt-10 flex justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="h-11 w-44 rounded-full"
                  onClick={() => loansInf.fetchNextPage()}
                  disabled={loansInf.isFetchingNextPage}
                >
                  {loansInf.isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </motion.div>
            </div>
          ) : null}
        </div>
        <div className="mt-12 h-px w-full bg-neutral-200" />
      </main>
      <Footer />
      {/* GIVE REVIEW POPUP */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Give Review</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600">{reviewBookTitle}</p>
          <div className="mt-4">
            <p className="text-sm font-semibold text-neutral-900">Rating</p>
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const v = i + 1;
                const active = v <= reviewStars;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setReviewStars(v)}
                    className="h-10 w-10 rounded-full border border-neutral-200 hover:bg-neutral-50"
                    aria-label={`Star ${v}`}
                  >
                    <span
                      className={active ? "text-[#1E64E0]" : "text-neutral-300"}
                    >
                      ★
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold text-neutral-900">Comment</p>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Write your comment..."
              className="mt-3 h-28 w-full resize-none rounded-xl border border-neutral-300 p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-300"
            />
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-full"
              onClick={() => setReviewOpen(false)}
            >
              Cancel
            </Button>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                className="h-11 w-full rounded-full"
                onClick={submitReviewMock}
              >
                Submit
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
