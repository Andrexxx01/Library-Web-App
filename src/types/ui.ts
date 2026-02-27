import type { BookCategory } from "@/constants/categories";
export type SortBy = "RELEVANCE" | "TITLE_ASC" | "TITLE_DESC" | "AUTHOR_ASC" | "AUTHOR_DESC" | "PUBLICATION_DATE_ASC" | "PUBLICATION_DATE_DESC";
export type FilterBy = "ALL" | "AVAILABLE" | "BORROWED";
export type RatingFilter = 1 | 2 | 3 | 4 | 5;
export type UiState = {
    search: string;
    sortBy: SortBy;
    category: BookCategory | null;
    author: string;
    minRating: RatingFilter | null;
    page: number;
    pageSize: number;
    filterBy: FilterBy;
};