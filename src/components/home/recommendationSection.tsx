"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRecommendBooksQuery } from "@/services/queries/recommend";
import BookCard from "@/components/common/bookCard";

function useIsDesktop(breakpointPx = 768) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpointPx]);
  return isDesktop;
}

type Props = {
  title?: string;
};

export default function RecommendationSection({
  title = "Recommendation",
}: Props) {
  const isDesktop = useIsDesktop(768);
  const [limit, setLimit] = useState(30);
  const [visibleCount, setVisibleCount] = useState(10);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useRecommendBooksQuery({
      by: "popular",
      page: 1,
      limit,
    });
  const books = data?.data.books ?? [];
  const pagination = data?.data.pagination;
  const step = isDesktop ? 5 : 2;

  useEffect(() => {
    setVisibleCount(10);
  }, [isDesktop]);

  const shownBooks = useMemo(
    () => books.slice(0, visibleCount),
    [books, visibleCount],
  );

  const hasMoreToShow = visibleCount < books.length;

  const canPossiblyLoadMoreFromServer = useMemo(() => {
    if (!pagination) return false;
    return pagination.total === limit;
  }, [pagination, limit]);

  function handleLoadMore() {
    if (hasMoreToShow) {
      setVisibleCount((prev) => Math.min(prev + step, books.length));
      return;
    }

    if (canPossiblyLoadMoreFromServer) {
      setLimit((prev) => prev + 10);
      return;
    }
  }

  const showLoadMoreButton = useMemo(() => {
    return hasMoreToShow || canPossiblyLoadMoreFromServer;
  }, [hasMoreToShow, canPossiblyLoadMoreFromServer]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <h2 className="text-2xl font-bold text-black md:text-4xl">{title}</h2>
        {/* Loading */}
        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
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
        ) : null}
        {/* Error */}
        {isError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load recommendations.
            <div className="mt-2 opacity-80">
              {(error as any)?.message
                ? String((error as any).message)
                : "Unknown error"}
            </div>
            <Button
              variant="outline"
              className="mt-3 rounded-full"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : null}
        {/* Grid */}
        {!isLoading && !isError ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
              {shownBooks.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                />
              ))}
            </div>
            {/* Load More */}
            {showLoadMoreButton ? (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-10"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                >
                  {isFetching ? "Loading..." : "Load More"}
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
