"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  /**
   * Untuk nanti (setelah cart query/mutation jadi).
   * Kalau 0 -> badge tidak tampil (sesuai figma kamu).
   */
  cartCount?: number;
  /**
   * default: false (home belum login)
   */
  isAuthenticated?: boolean;
};

const iconHover = {
  rotate: [0, -6, 6, -3, 3, 0],
  transition: { duration: 0.35 },
};

export default function Header({
  cartCount = 0,
  isAuthenticated = false,
}: AppHeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");

  const showBadge = cartCount > 0;

  const cartBadgeText = useMemo(() => {
    if (cartCount > 99) return "99+";
    return String(cartCount);
  }, [cartCount]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* LEFT: Logo (mobile: icon only, desktop: icon + text) */}
        <Link href="/#hero" className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Image
              src="/Logo.svg"
              alt="Booky Logo"
              width={36}
              height={36}
              priority
            />
          </motion.div>

          <span className="hidden text-2xl font-bold text-black md:inline">
            Booky
          </span>
        </Link>

        {/* RIGHT: Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          {!mobileSearchOpen ? (
            <>
              {/* Search Icon */}
              <motion.button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                whileHover={iconHover}
                whileTap={{ scale: 0.95 }}
                aria-label="Open search"
              >
                <Image src="/Search.svg" alt="Search" width={22} height={22} />
              </motion.button>

              {/* Cart Icon */}
              <motion.button
                type="button"
                onClick={() => {
                  // nanti arahkan ke /cart
                  // router.push("/cart")
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                whileHover={iconHover}
                whileTap={{ scale: 0.95 }}
                aria-label="Open cart"
              >
                <Image src="/Bag.svg" alt="Cart" width={22} height={22} />

                {/* badge hanya tampil kalau ada item */}
                {showBadge ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                    {cartBadgeText}
                  </span>
                ) : null}
              </motion.button>

              {/* Menu Icon */}
              <motion.button
                type="button"
                onClick={() => {
                  // nanti buka dropdown menu
                }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                whileHover={iconHover}
                whileTap={{ scale: 0.95 }}
                aria-label="Open menu"
              >
                <Image src="/Menu.svg" alt="Menu" width={22} height={22} />
              </motion.button>
            </>
          ) : (
            // Mobile Search Mode
            <div className="flex w-full items-center gap-3">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <Image
                    src="/Search.svg"
                    alt="Search"
                    width={18}
                    height={18}
                  />
                </span>

                <input
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  placeholder="Search book"
                  className="
                    h-12 w-full rounded-full border border-zinc-300 bg-white pl-12 pr-4
                    text-base outline-none
                    focus-visible:ring-2 focus-visible:ring-brand-primary-300
                  "
                />
              </div>

              <motion.button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setDraftSearch("");
                }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                whileHover={iconHover}
                whileTap={{ scale: 0.95 }}
                aria-label="Close search"
              >
                <Image src="/x-close.svg" alt="Close" width={22} height={22} />
              </motion.button>
            </div>
          )}
        </div>

        {/* RIGHT: Desktop (Login/Register) */}
        <div className="hidden items-center gap-4 md:flex">
          {!isAuthenticated ? (
            <>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="h-10 rounded-full px-8"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="h-10 rounded-full px-8" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </motion.div>
            </>
          ) : (
            // nanti kalau sudah login, kita ganti jadi avatar/menu dsb
            <></>
          )}
        </div>
      </div>
    </header>
  );
}
