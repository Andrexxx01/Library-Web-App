import type { Pagination } from "@/types/api";
import type { Book } from "@/types/book";

export type BookListQueryParams = {
  q?: string;
  categoryId?: number;
  authorId?: number;
  minRating?: 1 | 2 | 3 | 4 | 5;
  page?: number;
  limit?: number;
};

export type BookListData = {
  books: Book[];
  pagination: Pagination;
};
