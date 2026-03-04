import type { Pagination } from "@/types/api";

export type ReviewUser = {
  id: number;
  name: string;
};

export type ReviewStar = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: number;
  star: ReviewStar;
  comment: string;
  createdAt: string;
  userId?: number;
  bookId?: number;
  user?: ReviewUser;
  book?: {
    id: number;
    title: string;
    coverImage: string | null;
    author?: { id: number; name: string };
    category?: { id: number; name: string };
  };
};

export type BookReviewsData = {
  reviews: Review[];
  pagination: Pagination;
  bookId?: number;
};

export type CreateReviewPayload = {
  bookId: number;
  star: ReviewStar;
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

export type MyReviewsData = {
  reviews: Review[];
  pagination: Pagination;
};
