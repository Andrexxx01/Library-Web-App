"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Book } from "@/types/book";

type Props = {
  book: Book;
  onClick?: (book: Book) => void;
  className?: string;
  sizes?: string;
};

export default function BookCard({
  book,
  onClick,
  className,
  sizes = "(max-width: 768px) 50vw, 20vw",
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick?.(book)}
      className={[
        `
          overflow-hidden text-left
          rounded-2xl bg-white
          shadow-[0px_10px_22px_rgba(0,0,0,0.06)]
          ring-1 ring-black/5
          cursor-pointer
        `,
        className ?? "",
      ].join(" ")}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-3/4 w-full bg-brand-neutral-100">
        <Image
          src={book.coverImage || "/placeholder-cover.jpg"}
          alt={book.title || "Book cover"}
          fill
          className="object-cover"
          sizes={sizes}
        />
      </div>

      <div className="p-3">
        <p className="text-sm font-semibold text-black md:text-base">
          {book.title || "Book Name"}
        </p>

        <p className="mt-1 text-xs text-zinc-500 md:text-sm">
          {book.author?.name || "Author name"}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Image src="/Star.svg" alt="Star" width={16} height={16} />
          <span className="text-xs font-semibold text-zinc-700 md:text-sm">
            {typeof book.rating === "number" ? book.rating.toFixed(1) : "0.0"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
