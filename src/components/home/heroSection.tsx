"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HeroSlide = {
  id: number;
  imageSrc: string; 
};

type CategoryCard = {
  key: string;
  label: string;
  iconSrc: string;
};

const SLIDES: HeroSlide[] = [
  { id: 0, imageSrc: "/background-herosection.jpg" },
  { id: 1, imageSrc: "/background-herosection.jpg" },
  { id: 2, imageSrc: "/background-herosection.jpg" },
];

const CATEGORIES: CategoryCard[] = [
  { key: "fiction", label: "Fiction", iconSrc: "/Fiction.svg" },
  { key: "non-fiction", label: "Non-Fiction", iconSrc: "/Non-fiction.svg" },
  {
    key: "self",
    label: "Self-\nImprovement",
    iconSrc: "/Self-improvement.svg",
  },
  { key: "finance", label: "Finance", iconSrc: "/Finance.svg" },
  { key: "science", label: "Science", iconSrc: "/Science.svg" },
  { key: "education", label: "Education", iconSrc: "/Education.svg" },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);

  const paginationSrc = useMemo(() => {
    if (active === 0) return "/pagination-left.svg";
    if (active === 1) return "/pagination-middle.svg";
    return "/pagination-right.svg";
  }, [active]);

  function nextSlide() {
    setActive((prev) => (prev + 1) % 3);
  }

  return (
    <section id="hero"className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-4 md:pt-8">
        {/* Banner */}
        <div className="overflow-hidden rounded-3xl bg-brand-neutral-100">
          <div
            className="
              relative w-full
              h-42
              md:h-80
            "
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ x: "12%", opacity: 0.9 }}
                animate={{ x: "0%", opacity: 1 }}
                exit={{ x: "-12%", opacity: 0.9 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
              >
                <Image
                  src={SLIDES[active].imageSrc}
                  alt="Hero banner"
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center py-3">
          <motion.button
            type="button"
            onClick={nextSlide}
            className="cursor-pointer"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            aria-label="Next hero slide"
          >
            <Image
              src={paginationSrc}
              alt="Pagination"
              width={40}
              height={12}
              priority
            />
          </motion.button>
        </div>

        {/* Category Cards */}
        <div
          className="
            grid gap-4
            grid-cols-3
            md:grid-cols-6
            pb-6
          "
        >
          {CATEGORIES.map((c) => (
            <motion.button
              key={c.key}
              type="button"
              onClick={() => {
                // nanti: route ke /books?categoryId=...
              }}
              className="
                group cursor-pointer text-left
                rounded-2xl bg-white
                shadow-[0px_8px_20px_rgba(0,0,0,0.06)]
                ring-1 ring-black/5
                p-3
              "
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="rounded-xl bg-[#E6F0FF] p-3">
                <div className="relative h-9 w-9 md:h-10 md:w-10">
                  <Image
                    src={c.iconSrc}
                    alt={c.label.replace("\n", " ")}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm font-semibold text-black md:text-base">
                {c.label}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
