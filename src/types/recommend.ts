import type { Book } from "@/types/book";
import type { Pagination } from "@/types/api";

export type RecommendMode = "popular" | "rating" ; 

export type RecommendBooksData = {
  mode: RecommendMode | string;
  books: Book[];
  pagination: Pagination;
};

export type RecommendBooksParams = {
  by?: "popular"; 
  page?: number;
  limit?: number;
};
