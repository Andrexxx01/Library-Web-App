"use client";

import Image from "next/image";
import { dayjs } from "@/lib/dayjs";
import type { Review } from "@/types/review";

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: v }).map((_, i) => (
        <Image
          key={i}
          src="/Star.svg"
          alt="star"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      ))}
    </div>
  );
}

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <Image
            src="/Gambar Authors.svg"
            alt="avatar"
            fill
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {review.user?.name}
          </p>
          <p className="text-xs text-neutral-500">
            {dayjs(review.createdAt).format("DD MMMM YYYY, HH:mm")}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <Stars value={review.star} />
        <p className="mt-3 text-sm leading-6 text-neutral-700">
          {review.comment}
        </p>
      </div>
    </div>
  );
}
