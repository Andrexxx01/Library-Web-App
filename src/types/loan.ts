export type LoanStatus = "BORROWED" | "RETURNED";

export type LoanBookLite = {
  id: number;
  title: string;
  coverImage: string | null;
};

export type Loan = {
  id: number;
  userId: number;
  bookId: number;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  book: LoanBookLite;
};

export type MyLoansData = {
  loans: Loan[];
};

export type BorrowDays = 3 | 5 | 10;

// direct flow
export type CreateLoanPayload = {
  bookId: number;
  days: BorrowDays;
};

// normal flow (from cart)
export type CreateLoansFromCartPayload = {
  itemIds: number[]; // cartItemIds
  days: BorrowDays;
  borrowDate: string;
};

