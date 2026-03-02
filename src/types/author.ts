import type { ApiResponse } from "@/types/api";

export type Author = {
  id: number;
  name: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PopularAuthor = {
  id: number;
  name: string;
  bio: string | null;
  bookCount: number;
  accumulatedScore: number;
};

export type PopularAuthorsData = {
  authors: PopularAuthor[];
};

export type PopularAuthorsParams = {
  limit?: number;
};

export type PopularAuthorsResponse = ApiResponse<PopularAuthorsData>;
