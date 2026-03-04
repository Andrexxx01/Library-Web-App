"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import HeaderContainer from "@/components/layout/headerContainer";
import Footer from "@/components/layout/footer";
import BookCard from "@/components/common/bookCard";
import { Button } from "@/components/ui/button";
import { useAuthorBooksQuery } from "@/services/queries/authors";

export default function AuthorDetailPage() {
  const router = useRouter();
  const params = useParams<Record<string, string | string[]>>();
  const raw =
    (typeof params.id === "string" && params.id) ||
    (typeof params.authorId === "string" && params.authorId) ||
    "";

  const authorId = Number(raw);
  if (!Number.isFinite(authorId) || authorId <= 0) {
    throw new Error("Invalid author id");
  }

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAuthorBooksQuery({
      authorId,
      page: 1,
      limit: 8,
    });

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-white">
        <HeaderContainer />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 mt-14 md:mt-20">
          {/* Author card skeleton */}
          <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4 md:p-6">
            <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
            <div className="flex-1">
              <div className="h-5 w-48 animate-pulse rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-28 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
          <div className="mt-8 h-8 w-44 animate-pulse rounded bg-neutral-200" />
          {/* Books grid skeleton */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
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
            ))}
          </div>
          <div className="mt-10 h-px w-full bg-neutral-200" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-dvh bg-white">
        <HeaderContainer />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 mt-14 md:mt-20">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load author detail.
            <div className="mt-2 opacity-80">
              {(error as any)?.message
                ? String((error as any).message)
                : "Unknown error"}
            </div>
            <Button
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Loading..." : "Retry"}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const author = data?.data?.author;
  const books = data?.data?.books ?? [];
  const bookCount = data?.data?.bookCount ?? 0;

  if (!author) {
    throw new Error("Author data is missing.");
  }

  return (
    <div className="min-h-dvh bg-white">
      <HeaderContainer />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 mt-14 md:mt-20">
        {/* Author Card */}
        <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4 md:p-6">
          <Image
            src="/Gambar Authors.svg"
            alt="Author"
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <p className="text-lg font-semibold text-neutral-900">
              {author.name}
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
              <Image src="/Book.svg" alt="Book" width={18} height={18} />
              <span>{bookCount} books</span>
            </div>
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-bold text-neutral-900">Book List</h1>
        {/* Empty */}
        {books.length === 0 ? (
          <div className="mt-10 flex justify-center">
            <p className="text-sm text-neutral-600">
              There is no book on this Author !
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {books.slice(0, 8).map((b) => (
              <BookCard
                key={b.id}
                book={b}
                onClick={() => router.push(`/books/${b.id}`)}
              />
            ))}
          </div>
        )}
        <div className="mt-10 h-px w-full bg-neutral-200" />
      </main>
      <Footer />
    </div>
  );
}
