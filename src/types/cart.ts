import type { Book } from "@/types/book";

export type CartItem = {
  id: number; // cartItemId
  bookId: number;
  addedAt: string; 
  book: Book;
};

export type CartData = {
  cartId: number;
  items: CartItem[];
  itemCount: number;
};

export type AddCartItemPayload = {
  bookId: number; 
};
