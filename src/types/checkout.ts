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
  id: number; // cartItemId
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
