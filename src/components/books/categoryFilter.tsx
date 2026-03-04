"use client";

import Image from "next/image";

type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
  selectedCategory?: number;
  onCategoryChange: (id: number) => void;

  selectedRating: number;
  onRatingChange: (rating: 1 | 2 | 3 | 4 | 5) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedRating,
  onRatingChange,
}: Props) {
  const displayCategories = [
    "Fiction",
    "Non-Fiction",
    "Self-Improvement",
    "Finance",
    "Science",
    "Education",
  ];

  const filteredCategories = categories.filter((c) =>
    displayCategories.includes(c.name),
  );

  return (
    <div className="rounded-2xl bg-neutral-50 p-6">
      <h3 className="font-semibold text-neutral-900">FILTER</h3>
      {/* CATEGORY */}
      <div className="mt-6">
        <p className="font-medium text-neutral-700">Category</p>
        <div className="mt-4 space-y-3">
          {filteredCategories.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategory === c.id}
                onChange={() => onCategoryChange(c.id)}
                className="h-4 w-4 accent-blue-600"
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="my-6 h-px bg-neutral-200" />
      {/* RATING */}
      <div>
        <p className="font-medium text-neutral-700">Rating</p>
        <div className="mt-4 space-y-3">
          {[5, 4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRating === r}
                onChange={() => onRatingChange(r as any)}
                className="h-4 w-4 accent-blue-600"
              />
              <Image src="/Star.svg" alt="star" width={16} height={16} />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
