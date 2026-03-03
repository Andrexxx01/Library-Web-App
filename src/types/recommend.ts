import type { Book } from "@/types/book";
import type { Pagination } from "@/types/api";

export type RecommendMode = "popular" | "rating" ; 

export type RecommendBooksData = {
  mode: RecommendMode;
  books: Book[];
  pagination: Pagination;
};

export type RecommendBooksParams = {
  by?: RecommendMode; 
  page?: number;
  limit?: number;
};
