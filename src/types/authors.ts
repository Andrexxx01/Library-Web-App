import type { Author } from "@/types/author";

export type AuthorsData = {
  authors: Author[];
};

export type AuthorsQueryParams = {
  q?: string;
};

export type PopularAuthorsData = {
  authors: Author[];
};
