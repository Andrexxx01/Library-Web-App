import type { Pagination } from "@/types/api";

export type ReviewUser = {
  id: number;
  name: string;
};

export type Review = {
  id: number;
  star: 1 | 2 | 3 | 4 | 5;
  comment: string;
  userId: number;
  bookId: number;
  createdAt: string;
  user?: ReviewUser;
};

export type BookReviewsData = {
  bookId: number;
  reviews: Review[];
  pagination: Pagination;
};

export type CreateReviewPayload = {
  bookId: number;
  star: 1 | 2 | 3 | 4 | 5;
  comment: string;
};

export type BookStats = {
  rating: number;
  reviewCount: number;
};

export type CreateReviewData = {
  review: Review;
  bookStats: BookStats;
};

export type DeleteReviewData = {
  bookStats: BookStats;
};