"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePopularAuthorsQuery } from "@/services/queries/authors";
import { useRouter } from "next/navigation";

type Props = {
  title?: string;
};

export default function PopularAuthorsSection({
  title = "Popular Authors",
}: Props) {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePopularAuthorsQuery({ limit: 10 });

  const router = useRouter();
  const authors = data?.data.authors ?? [];
  const top4 = useMemo(() => authors.slice(0, 4), [authors]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Divider line */}
        <div className="mb-10 h-px w-full bg-zinc-200" />
        <h2 className="text-2xl font-bold text-black md:text-4xl">{title}</h2>
        {/* Loading */}
        {isLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white p-5 shadow-[0px_10px_22px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-zinc-200" />
                  <div className="flex-1">
                    <div className="h-4 w-2/3 rounded bg-zinc-200" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-zinc-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {/* Error */}
        {isError ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load popular authors.
            <div className="mt-2 opacity-80">
              {(error as any)?.message
                ? String((error as any).message)
                : "Unknown error"}
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-white px-6 text-sm font-medium text-red-700"
              disabled={isFetching}
            >
              Retry
            </button>
          </div>
        ) : null}
        {/* Cards */}
        {!isLoading && !isError ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            {top4.map((a) => (
              <motion.button
                key={a.id}
                type="button"
                onClick={() => {
                  router.push(`/author/${a.id}`)
                }}
                className="
                  w-full cursor-pointer text-left
                  rounded-2xl bg-white p-5
                  shadow-[0px_10px_22px_rgba(0,0,0,0.06)]
                  ring-1 ring-black/5
                "
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar fixed (dari figma) */}
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src="/Gambar Authors.svg"
                      alt="Author avatar"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-black">
                      {a.name || "Author name"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Image
                        src="/Book.svg"
                        alt="Book icon"
                        width={18}
                        height={18}
                      />
                      <p className="text-sm text-zinc-600">
                        {a.bookCount} books
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : null}
        {/* Bottom divider line */}
        <div className="mt-12 h-px w-full bg-zinc-200" />
      </div>
    </section>
  );
}
