"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import HeaderContainer from "@/components/layout/headerContainer";
import Footer from "@/components/layout/footer";
import CategoryFilter from "@/components/books/categoryFilter";
import BookCard from "@/components/common/bookCard";
import { Button } from "@/components/ui/button";
import { useCategoriesQuery } from "@/services/queries/categories";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Book, BookListData } from "@/types/book";

type BooksResponse = ApiResponse<BookListData>;

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedRating, setSelectedRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [openMobileFilter, setOpenMobileFilter] = useState(false);

  // ===== CATEGORIES =====
  const {
    data: categoriesRes,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCategoriesQuery();

  const categories = categoriesRes?.data.categories ?? [];

  const categoryId = selectedCategory ?? categories[0]?.id;

  // ===== BOOKS =====
  const {
    data: booksRes,
    isLoading: booksLoading,
    isError: booksError,
    refetch: refetchBooks,
  } = useQuery<BooksResponse>({
    queryKey: ["books", categoryId, selectedRating],
    enabled: !!categoryId,
    queryFn: () =>
      api.get<BooksResponse>(ENDPOINTS.books.list, {
        query: {
          categoryId,
          minRating: selectedRating,
          page: 1,
          limit: 8,
        },
      }),
  });

  const books: Book[] = booksRes?.data.books ?? [];
  const isLoading = categoriesLoading || booksLoading;
  const isError = categoriesError || booksError;

  return (
    <div className="min-h-dvh bg-white">
      <HeaderContainer />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-neutral-900">Book List</h1>
        {/* MOBILE FILTER BAR */}
        <div className="relative mt-6 md:hidden">
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-neutral-700">Filter</p>
            <motion.button
              onClick={() => setOpenMobileFilter((v) => !v)}
              whileHover={{ rotate: -10 }}
              className="cursor-pointer"
            >
              <Image
                src="/filter-lines.svg"
                alt="filter"
                width={22}
                height={22}
              />
            </motion.button>
          </div>
          {/* DROPDOWN */}
          <AnimatePresence>
            {openMobileFilter && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-16 z-50"
              >
                <CategoryFilter
                  categories={categories}
                  selectedCategory={categoryId}
                  onCategoryChange={(id) => {
                    setSelectedCategory(id);
                  }}
                  selectedRating={selectedRating}
                  onRatingChange={(r) => setSelectedRating(r)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-6 flex gap-8">
          {/* LEFT SIDE FILTER */}
          <div className="hidden w-72 md:block">
            {!categoriesLoading && (
              <CategoryFilter
                categories={categories}
                selectedCategory={categoryId}
                onCategoryChange={(id) => setSelectedCategory(id)}
                selectedRating={selectedRating}
                onRatingChange={(r) => setSelectedRating(r)}
              />
            )}
          </div>
          {/* RIGHT SIDE BOOKS */}
          <div className="flex-1">
            {/* ERROR */}
            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load books
                <Button
                  variant="outline"
                  className="mt-3 rounded-full"
                  onClick={() => {
                    refetchCategories();
                    refetchBooks();
                  }}
                >
                  Retry
                </Button>
              </div>
            )}
            {/* LOADING */}
            {isLoading && (
              <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
                {/* Title */}
                <div className="h-8 w-40 animate-pulse rounded bg-neutral-200" />
                {/* Mobile filter bar */}
                <div className="mt-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 md:hidden">
                  <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
                  <div className="h-5 w-5 animate-pulse rounded bg-neutral-200" />
                </div>
                <div className="mt-6 flex gap-8">
                  {/* Book grid */}
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="
                  animate-pulse
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  shadow-[0px_10px_22px_rgba(0,0,0,0.06)]
                  ring-1 ring-black/5
                "
                        >
                          {/* Cover */}
                          <div className="aspect-3/4 w-full bg-neutral-200" />

                          {/* Content */}
                          <div className="p-3">
                            <div className="h-4 w-3/4 rounded bg-neutral-200" />

                            <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />

                            <div className="mt-3 h-3 w-1/4 rounded bg-neutral-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Footer divider */}
                <div className="mt-10 h-px w-full bg-neutral-200" />
              </div>
            )}
            {/* EMPTY */}
            {!isLoading && books.length === 0 && (
              <div className="flex min-h-105 items-center justify-center">
                <p className="text-sm text-neutral-600">
                  No book at this category !
                </p>
              </div>
            )}
            {/* GRID */}
            {!isLoading && books.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-10 h-px w-full bg-neutral-200" />
      </main>
      <Footer />
    </div>
  );
}
