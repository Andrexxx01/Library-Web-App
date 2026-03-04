"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import type { LoanStatus, Loan } from "@/types/loan";
import { Button } from "@/components/ui/button";
import { getLoanDurationDays } from "@/services/queries/loans";

function formatPretty(dateIso: string) {
  return dayjs(dateIso).format("D MMM YYYY");
}

function statusLabel(status: LoanStatus) {
  if (status === "BORROWED")
    return { text: "Active", cls: "bg-[#EAF7EA] text-[#1A7F2E]" };
  if (status === "RETURNED")
    return { text: "Returned", cls: "bg-[#EAF7EA] text-[#1A7F2E]" };
  return { text: "Overdue", cls: "bg-[#FFECEF] text-[#FF2D55]" };
}

type Props = {
  loan: Loan;
  categoryName?: string | null;
  authorName?: string | null;
  reviewed: boolean;
  dueDateText?: string;

  onReturn: () => void;
  onGiveReview: () => void;
  onDeleteReview: () => void;

  loadingReturn?: boolean;
  loadingDelete?: boolean;
};

export default function LoanCard({
  loan,
  categoryName,
  authorName,
  reviewed,
  dueDateText,
  onReturn,
  onGiveReview,
  onDeleteReview,
  loadingReturn,
  loadingDelete,
}: Props) {
  const st = statusLabel(loan.status);

  const duration = getLoanDurationDays(loan); // pastikan fn ini handle BORROWED/RETURNED/LATE
  const showReturn = loan.status === "BORROWED";
  const showDelete = !showReturn && reviewed;
  const dueText = dueDateText ?? formatPretty(loan.dueAt);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0px_10px_22px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
      {/* header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-neutral-900">Status</span>
          <span
            className={`rounded-md px-3 py-1 text-xs font-semibold ${st.cls}`}
          >
            {st.text}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-neutral-900">
            Due Date
          </span>
          <span className="rounded-md bg-[#FFECEF] px-3 py-1 text-xs font-semibold text-[#FF2D55]">
            {dueText}
          </span>
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-neutral-200" />
      {/* body */}
      <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center">
        {/* left: cover + info */}
        <div className="flex items-start gap-4 md:flex-1">
          <div className="h-24 w-20 overflow-hidden rounded-md bg-neutral-100">
            {loan.book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={loan.book.coverImage}
                alt={loan.book.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-md border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-900">
              {categoryName?.trim() ? categoryName : "Category"}
            </span>
            <p className="mt-2 line-clamp-1 text-lg font-bold text-neutral-900">
              {loan.book.title}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {authorName?.trim() ? authorName : "Author name"}
            </p>
            <p className="mt-3 text-sm font-semibold text-neutral-900">
              {formatPretty(loan.borrowedAt)}{" "}
              <span className="mx-2 text-neutral-400">·</span>
              Duration {duration} Days
            </p>
          </div>
        </div>
        {/* right: button */}
        <div className="md:flex md:justify-end">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {showReturn ? (
              <Button
                className="h-11 w-full rounded-full md:w-44"
                onClick={onReturn}
                disabled={!!loadingReturn}
              >
                {loadingReturn ? "Processing..." : "Return Book"}
              </Button>
            ) : showDelete ? (
              <Button
                className="h-11 w-full rounded-full bg-red-500 hover:bg-red-600 md:w-44"
                onClick={onDeleteReview}
                disabled={!!loadingDelete}
              >
                {loadingDelete ? "Deleting..." : "Delete Review"}
              </Button>
            ) : (
              <Button
                className="h-11 w-full rounded-full md:w-44"
                onClick={onGiveReview}
              >
                Give Review
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
