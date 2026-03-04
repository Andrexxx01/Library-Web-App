import type { Pagination } from "@/types/api";

export type LoanStatus = "BORROWED" | "RETURNED" | "LATE";

export type LoanBookLite = {
  id: number;
  title: string;
  coverImage: string | null;
};

export type LoanRaw = {
  id: number;
  userId: number;
  bookId: number;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  book: LoanBookLite;
};

export type Loan = LoanRaw;

export type LoansDataRaw = {
  loans: LoanRaw[];
  pagination: Pagination;
};

export type LoansData = {
  loans: Loan[];
  pagination: Pagination;
};

export type MyLoansData = LoansData;

export type BorrowDays = 3 | 5 | 10;

export type CreateLoanPayload = {
  bookId: number;
  durationDays: BorrowDays;
};

export type CreateLoansFromCartPayload = {
  itemIds: number[];
  durationDays: BorrowDays;
  borrowDate: string;
};
