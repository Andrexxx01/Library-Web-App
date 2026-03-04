import type { Book } from "@/types/book";

export type CheckoutUserRaw = {
  name: string;
  email: string;
  nomorHandphone: string | null;
};

export type CheckoutUser = {
  name: string;
  email: string;
  phone: string | null;
};

export type CheckoutItem = {
  id: number; 
  bookId: number;
  book: Book;
};

export type CheckoutDataRaw = {
  user: CheckoutUserRaw;
  items: CheckoutItem[];
  itemCount: number;
};

export type CheckoutData = {
  user: CheckoutUser;
  items: CheckoutItem[];
  itemCount: number;
};

export type MeProfileRaw = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
};

export type MeLoanStats = {
  borrowed: number;
  late: number;
  returned: number;
  total: number;
};

export type MeDataRaw = {
  profile: MeProfileRaw;
  loanStats: MeLoanStats;
  reviewsCount: number;
};

export type MeData = MeDataRaw;

export type DurationDays = 3 | 5 | 10;

export type LoansFromCartPayload = {
  itemIds: number[];
  borrowDate: string; 
  durationDays: DurationDays;
};

export type LoansFromCartResponseData = {
  loans: Array<{
    id: number;
    userId: number;
    bookId: number;
    status: string;
    borrowedAt: string;
    dueAt: string;
    returnedAt: string | null;
  }>;
  failed: Array<unknown>;
  removedFromCart: number;
  message: string;
};

export type LoanDirectPayload = {
  bookId: number;
  durationDays: DurationDays;
};

export type LoanDirectResponseData = {
  loan: {
    id: number;
    userId: number;
    bookId: number;
    status: string;
    borrowedAt: string;
    dueAt: string;
    returnedAt: string | null;
  };
};
