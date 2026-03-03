"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ReviewCard from "@/components/books/reviewCard";
import BookCard from "@/components/common/bookCard";
import { Button } from "@/components/ui/button";

import type {
  BookDetailResponse,
  BooksListResponse,
} from "@/services/queries/books";
import { getBookById, getRelatedBooks } from "@/services/queries/books";
import type { Book } from "@/types/book";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const isDesktop = useIsDesktop();

  const bookId = Number(params.id);

  const [visibleReviews, setVisibleReviews] = useState(3);

  useEffect(() => {
    setVisibleReviews(isDesktop ? 6 : 3); // desktop: 2 kolom x 3 baris
  }, [isDesktop]);

  const {
    data: bookRes,
    isLoading: bookLoading,
    isError: bookIsError,
    error: bookError,
    refetch: refetchBook,
  } = useQuery<BookDetailResponse>({
    queryKey: ["book", bookId],
    queryFn: () => getBookById(bookId),
    enabled: Number.isFinite(bookId) && bookId > 0,
  });

  const book = bookRes?.data;
  const categoryId = book?.categoryId;

  const {
    data: relatedRes,
    isLoading: relatedLoading,
    isError: relatedIsError,
    error: relatedError,
    refetch: refetchRelated,
  } = useQuery<BooksListResponse>({
    queryKey: ["relatedBooks", categoryId],
    queryFn: () =>
      getRelatedBooks({ categoryId: categoryId!, page: 1, limit: 6 }),
    enabled: Number.isFinite(categoryId) && (categoryId ?? 0) > 0,
  });

  const reviews = book?.reviews ?? [];
  const shownReviews = reviews.slice(0, visibleReviews);
  const hasMoreReviews = reviews.length > shownReviews.length;

  const handleLoadMore = () => {
    setVisibleReviews((prev) => prev + (isDesktop ? 2 : 1));
  };

  const outOfStockToast = () => toast.error("This book is out of stock !");

  const handleAddToCart = () => {
    if (!book) return;
    if (book.availableCopies === 0) return outOfStockToast();
    toast.success("Added to cart");
  };

  const handleBorrow = () => {
    if (!book) return;
    if (book.availableCopies === 0) return outOfStockToast();

    // ✅ Optimistic UI: update cache sesuai bentuk ApiResponse<Book>
    qc.setQueryData<BookDetailResponse>(["book", bookId], (old) => {
      if (!old?.data) return old as any;
      return {
        ...old,
        data: {
          ...old.data,
          availableCopies: Math.max(0, old.data.availableCopies - 1),
        },
      };
    });

    if (categoryId) {
      qc.setQueryData<BooksListResponse>(
        ["relatedBooks", categoryId],
        (old) => {
          if (!old?.data?.books) return old as any;
          return {
            ...old,
            data: {
              ...old.data,
              books: old.data.books.map((b) =>
                b.id === bookId
                  ? {
                      ...b,
                      availableCopies: Math.max(0, b.availableCopies - 1),
                    }
                  : b,
              ),
            },
          };
        },
      );
    }

    toast.success("Borrowed successfully");
  };

  const relatedBooks: Book[] = useMemo(() => {
    const items = relatedRes?.data?.books ?? [];
    return items.filter((b) => b.id !== bookId).slice(0, 6);
  }, [relatedRes?.data?.books, bookId]);

  return (
    <div className="min-h-dvh bg-white">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 md:px-6 md:pb-10 md:pt-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span
            className="cursor-pointer hover:text-neutral-800"
            onClick={() => router.push("/")}
          >
            Home
          </span>
          <Image
            src="/chevron-right.svg"
            alt=">"
            width={14}
            height={14}
            className="opacity-70"
          />
          <span className="cursor-default text-neutral-500">Category</span>
          <Image
            src="/chevron-right.svg"
            alt=">"
            width={14}
            height={14}
            className="opacity-70"
          />
          <span className="line-clamp-1 text-neutral-800">
            {book?.title ?? "..."}
          </span>
        </div>

        {/* BOOK: Loading */}
        {bookLoading ? (
          <div className="mt-6 animate-pulse">
            <div className="grid gap-6 md:grid-cols-[360px_1fr]">
              <div className="aspect-3/4 w-full max-w-90 rounded-md bg-neutral-200" />
              <div className="space-y-3">
                <div className="h-6 w-1/3 rounded bg-neutral-200" />
                <div className="h-10 w-2/3 rounded bg-neutral-200" />
                <div className="h-4 w-1/3 rounded bg-neutral-200" />
                <div className="h-4 w-1/4 rounded bg-neutral-200" />
                <div className="h-24 w-full rounded bg-neutral-200" />
              </div>
            </div>
          </div>
        ) : null}

        {/* BOOK: Error */}
        {bookIsError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load book detail.
            <div className="mt-2 opacity-80">
              {(bookError as any)?.message
                ? String((bookError as any).message)
                : "Unknown error"}
            </div>
            <Button
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() => refetchBook()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {/* Section 1 */}
        {!bookLoading && !bookIsError && book ? (
          <section className="mt-5 md:mt-8">
            <div className="grid gap-6 md:grid-cols-[360px_1fr] md:items-start">
              {/* Cover */}
              <div className="mx-auto w-full max-w-90 md:mx-0">
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 360px"
                      priority
                    />
                  ) : null}
                </div>
              </div>

              {/* Content */}
              <div className="md:pt-2">
                <div className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                  {book.category?.name ?? "—"}
                </div>

                <h1 className="mt-3 text-2xl font-semibold leading-tight text-neutral-900 md:text-[32px]">
                  {book.title}
                </h1>

                <p className="mt-2 text-sm text-neutral-600">
                  {book.author?.name ?? "—"}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <Image
                    src="/Star.svg"
                    alt="star"
                    width={18}
                    height={18}
                    className="h-4.5 w-4.5"
                  />
                  <span className="text-sm font-semibold text-neutral-900">
                    {book.rating ?? 0}
                  </span>
                </div>

                {/* fixed stats */}
                <div className="mt-5 grid grid-cols-3 rounded-xl border border-neutral-200 bg-white">
                  <div className="px-4 py-3 text-center">
                    <p className="text-lg font-semibold text-neutral-900">
                      320
                    </p>
                    <p className="text-xs text-neutral-500">Page</p>
                  </div>
                  <div className="border-x border-neutral-200 px-4 py-3 text-center">
                    <p className="text-lg font-semibold text-neutral-900">
                      212
                    </p>
                    <p className="text-xs text-neutral-500">Rating</p>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <p className="text-lg font-semibold text-neutral-900">
                      179
                    </p>
                    <p className="text-xs text-neutral-500">Reviews</p>
                  </div>
                </div>

                <div className="mt-5 h-px w-full bg-neutral-200" />

                {/* Description clamp */}
                <div className="mt-5">
                  <p
                    className={`text-sm leading-6 text-neutral-700 ${isDesktop ? "line-clamp-3" : "line-clamp-6"}`}
                  >
                    {book.description ?? ""}
                  </p>
                </div>

                {/* Desktop buttons */}
                <div className="mt-6 hidden items-center gap-3 md:flex">
                  <Button
                    variant="outline"
                    className="h-11 w-44 rounded-full hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    className="h-11 w-44 rounded-full hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleBorrow}
                  >
                    Borrow Book
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 h-px w-full bg-neutral-200 md:mt-8" />
          </section>
        ) : null}

        {/* Section 2: Review */}
        {!bookLoading && !bookIsError && book ? (
          <section className="mt-8 md:mt-10">
            <h2 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
              Review
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <Image src="/Star.svg" alt="star" width={18} height={18} />
              <span className="text-sm font-semibold text-neutral-900">
                {book.rating ?? 0}
              </span>
              <span className="text-sm text-neutral-500">
                ({book.reviewCount ?? 0})
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {shownReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>

            {hasMoreReviews ? (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  className="h-11 w-40 rounded-full hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleLoadMore}
                >
                  Load More
                </Button>
              </div>
            ) : null}

            <div className="mt-8 h-px w-full bg-neutral-200" />
          </section>
        ) : null}

        {/* Section 3: Related Books */}
        <section className="mt-8 md:mt-10">
          <h2 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
            Related Books
          </h2>

          {/* Related: error */}
          {relatedIsError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load related books.
              <div className="mt-2 opacity-80">
                {(relatedError as any)?.message
                  ? String((relatedError as any).message)
                  : "Unknown error"}
              </div>
              <Button
                variant="outline"
                className="mt-3 rounded-full"
                onClick={() => refetchRelated()}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {!relatedIsError && !relatedLoading && relatedBooks.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-600">no related book</p>
          ) : null}

          {!relatedIsError ? (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
              {(relatedLoading ? Array.from({ length: 6 }) : relatedBooks).map(
                (b, i) =>
                  relatedLoading ? (
                    <div
                      key={i}
                      className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-[0px_10px_22px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
                    >
                      <div className="aspect-3/4 w-full bg-zinc-200" />
                      <div className="p-3">
                        <div className="h-4 w-3/4 rounded bg-zinc-200" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200" />
                        <div className="mt-3 h-3 w-1/4 rounded bg-zinc-200" />
                      </div>
                    </div>
                  ) : (
                    <BookCard key={(b as Book).id} book={b as Book} />
                  ),
              )}
            </div>
          ) : null}

          <div className="mt-8 h-px w-full bg-neutral-200" />
        </section>
      </main>

      {/* Floating footer (mobile only) */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 rounded-full hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button
            className="h-12 flex-1 rounded-full hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleBorrow}
          >
            Borrow Book
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
