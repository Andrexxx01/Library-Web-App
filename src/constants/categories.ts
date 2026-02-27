export const BOOK_CATEGORIES = [
    "Fiction",
    "Non-Fiction",
    "Self-Improvement",
    "Finance",
    "Science & Technology",
    "Education",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];