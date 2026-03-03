import type { Author } from "@/types/author";
import type { Category } from "@/types/category";
import type { Review } from "@/types/review";
import type { Pagination } from "@/types/api";

export type Book = {
  id: number;
  title: string;
  description: string;
  isbn: string;
  publishedYear: number;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authorId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
  category: Category;
  reviews?: Review[];
};

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

export type BookDetail = Book;
