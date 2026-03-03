"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type MouseEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutAction } from "@/store/authSlice";
import { useBookSearchQuery } from "@/services/queries/books";

type AppHeaderProps = {
  cartCount?: number;
  isAuthenticated?: boolean;
};

const iconHover = {
  rotate: [0, -6, 6, -3, 3, 0],
  transition: { duration: 0.35 },
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function safeCoverSrc(src: string | null | undefined) {
  if (!src) return "/background-herosection.jpg";
  return src;
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function Header({
  cartCount = 0,
  isAuthenticated = false,
}: AppHeaderProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // user dropdown states
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [desktopUserMenuOpen, setDesktopUserMenuOpen] = useState(false);

  // ===== SEARCH (added) =====
  const [searchOpen, setSearchOpen] = useState(false); // dropdown open/close
  const [activeIndex, setActiveIndex] = useState(-1); // keyboard highlight
  const [searchLimit, setSearchLimit] = useState(20);

  const debouncedSearch = useDebouncedValue(draftSearch, 300);

  const searchWrapRef = useRef<HTMLDivElement | null>(null); // input wrapper
  const dropdownRef = useRef<HTMLDivElement | null>(null); // dropdown wrapper

  const searchQuery = useBookSearchQuery(debouncedSearch, searchLimit);
  const searchBooks = searchQuery.data?.data.books ?? [];
  const searchPagination = searchQuery.data?.data.pagination;

  const keyword = debouncedSearch.trim();
  const showSearchDropdown = searchOpen && keyword.length > 0;

  // auto increase limit (+10) kalau books.length == limit dan total > limit
  useEffect(() => {
    if (!showSearchDropdown) return;
    if (!searchPagination) return;

    const total = searchPagination.total ?? 0;
    if (searchBooks.length === searchLimit && total > searchLimit) {
      setSearchLimit((v) => v + 10);
    }
  }, [showSearchDropdown, searchBooks.length, searchLimit, searchPagination]);

  // reset limit + activeIndex saat keyword berubah
  useEffect(() => {
    setSearchLimit(20);
    setActiveIndex(-1);
  }, [debouncedSearch]);

  // close dropdown when input cleared
  useEffect(() => {
    if (draftSearch.trim().length === 0) {
      setSearchOpen(false);
      setActiveIndex(-1);
    }
  }, [draftSearch]);

  // click outside close dropdown
  useEffect(() => {
    const onPointerDown = (e: Event) => {
      if (!showSearchDropdown) return;

      const target = e.target as Node | null;
      if (!target) return;

      const inInput = !!searchWrapRef.current?.contains(target);
      const inDropdown = !!dropdownRef.current?.contains(target);

      if (!inInput && !inDropdown) {
        setSearchOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [showSearchDropdown]);

  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const displayName = user?.name ?? "John Doe";

  const avatarSrc =
    user?.profilePhoto && user.profilePhoto.trim()
      ? user.profilePhoto
      : "/Gambar Authors.svg";

  const showBadge = cartCount > 0;

  const cartBadgeText = useMemo(() => {
    if (cartCount > 99) return "99+";
    return String(cartCount);
  }, [cartCount]);

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;

    e.preventDefault();

    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setMobileUserMenuOpen(false);
    setDesktopUserMenuOpen(false);

    // close search dropdown
    setSearchOpen(false);
    setActiveIndex(-1);

    setDraftSearch("");

    const el = document.getElementById("hero");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push("/#hero");
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    setMobileUserMenuOpen(false);
    setDesktopUserMenuOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);

    // close search dropdown
    setSearchOpen(false);
    setActiveIndex(-1);

    setDraftSearch("");
    router.replace("/");
  };

  function closeSearchDropdownOnly() {
    setSearchOpen(false);
    setActiveIndex(-1);
  }

  function goToBookByIndex(index: number) {
    const book = searchBooks[index];
    if (!book) return;

    router.push(`/books/${book.id}`);

    // close & clear
    setMobileSearchOpen(false);
    setDraftSearch("");
    closeSearchDropdownOnly();
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSearchDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchBooks.length === 0) return;
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= searchBooks.length ? 0 : next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (searchBooks.length === 0) return;
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? searchBooks.length - 1 : next;
      });
      return;
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        goToBookByIndex(activeIndex);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeSearchDropdownOnly();
      return;
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* LEFT: Logo */}
        <Link
          href="/#hero"
          onClick={handleLogoClick}
          className="flex items-center gap-2"
        >
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMobileUserMenuOpen(false);
                  setMobileSearchOpen(true);

                  // open dropdown when typing later
                  setSearchOpen(true);
                }}
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
                onClick={() => router.push("/cart")}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                whileHover={iconHover}
                whileTap={{ scale: 0.95 }}
                aria-label="Open cart"
              >
                <Image src="/Bag.svg" alt="Cart" width={22} height={22} />

                {showBadge ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                    {cartBadgeText}
                  </span>
                ) : null}
              </motion.button>

              {/* Menu / Avatar */}
              {!isAuthenticated ? (
                <motion.button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setDraftSearch("");
                    closeSearchDropdownOnly();

                    setMobileUserMenuOpen(false);
                    setMobileMenuOpen((v) => !v);
                  }}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                  whileHover={iconHover}
                  whileTap={{ scale: 0.95 }}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  <Image
                    src={mobileMenuOpen ? "/x-close.svg" : "/Menu.svg"}
                    alt={mobileMenuOpen ? "Close" : "Menu"}
                    width={22}
                    height={22}
                  />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => {
                    setMobileSearchOpen(false);
                    setDraftSearch("");
                    closeSearchDropdownOnly();

                    setMobileMenuOpen(false);
                    setMobileUserMenuOpen((v) => !v);
                  }}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                  whileHover={iconHover}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Open user menu"
                >
                  {avatarSrc.startsWith("/") ? (
                    <Image
                      src={avatarSrc}
                      alt="User avatar"
                      width={34}
                      height={34}
                      className="rounded-full"
                    />
                  ) : (
                    <img
                      src={avatarSrc}
                      alt="User avatar"
                      className="h-8.5 w-8.5 rounded-full object-cover"
                    />
                  )}
                </motion.button>
              )}
            </>
          ) : (
            // Mobile Search Mode
            <div className="flex w-full items-center gap-3">
              <div ref={searchWrapRef} className="relative flex-1">
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
                  onChange={(e) => {
                    setDraftSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
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
                  closeSearchDropdownOnly();
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

        {/* RIGHT: Desktop */}
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
            <div className="flex items-center gap-4">
              {/* Search bar desktop */}
              <div ref={searchWrapRef} className="relative w-130">
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
                  onChange={(e) => {
                    setDraftSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search book"
                  className="
                    h-10 w-full rounded-full border border-zinc-300 bg-white pl-12 pr-4
                    text-sm outline-none
                    focus-visible:ring-2 focus-visible:ring-brand-primary-300
                  "
                />
              </div>

              {/* Cart */}
              <motion.button
                type="button"
                onClick={() => router.push("/cart")}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                whileHover={iconHover}
                whileTap={{ scale: 0.95 }}
                aria-label="Open cart"
              >
                <Image src="/Bag.svg" alt="Cart" width={22} height={22} />
                {showBadge ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                    {cartBadgeText}
                  </span>
                ) : null}
              </motion.button>

              {/* User block */}
              <div className="relative">
                <motion.button
                  type="button"
                  onClick={() => setDesktopUserMenuOpen((v) => !v)}
                  className="flex items-center gap-3 rounded-full px-2 py-1"
                  whileTap={{ scale: 0.98 }}
                  aria-label="Open user menu"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDesktopUserMenuOpen(false);
                      router.push("/profile");
                    }}
                    className="flex items-center gap-3"
                  >
                    {avatarSrc.startsWith("/") ? (
                      <Image
                        src={avatarSrc}
                        alt="User avatar"
                        width={34}
                        height={34}
                        className="rounded-full"
                      />
                    ) : (
                      <img
                        src={avatarSrc}
                        alt="User avatar"
                        className="h-8.5 w-8.5 rounded-full object-cover"
                      />
                    )}

                    <span className="text-sm font-semibold text-black">
                      {displayName}
                    </span>
                  </motion.div>

                  <Image
                    src="/chevron-down.svg"
                    alt="Open"
                    width={18}
                    height={18}
                  />
                </motion.button>

                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {desktopUserMenuOpen ? (
                    <motion.div
                      key="desktop-user-menu"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 28,
                      }}
                      className="absolute right-0 mt-3 w-55 rounded-2xl bg-white p-4 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]"
                    >
                      {[
                        { label: "Profile", href: "/profile" },
                        { label: "Borrowed List", href: "/my-loans" },
                        { label: "Reviews", href: "/profile#reviews" },
                      ].map((item) => (
                        <motion.button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setDesktopUserMenuOpen(false);
                            router.push(item.href);
                          }}
                          className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-black"
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {item.label}
                        </motion.button>
                      ))}

                      <motion.button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-red-500"
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Logout
                      </motion.button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown (Login/Register) */}
      <AnimatePresence>
        {mobileMenuOpen && !mobileSearchOpen && !isAuthenticated ? (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="border-t bg-white md:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex items-center gap-4">
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-full"
                    asChild
                  >
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="h-12 w-full rounded-full" asChild>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Mobile User Dropdown (Authenticated) */}
      <AnimatePresence>
        {mobileUserMenuOpen && !mobileSearchOpen && isAuthenticated ? (
          <motion.div
            key="mobile-user-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="md:hidden"
          >
            <div className="mx-auto max-w-7xl px-4">
              <div className="mt-3 rounded-2xl bg-white p-6 shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
                {[
                  { label: "Profile", href: "/profile" },
                  { label: "Borrowed List", href: "/my-loans" },
                  { label: "Reviews", href: "/profile#reviews" },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileUserMenuOpen(false);
                      router.push(item.href);
                    }}
                    className="block w-full py-4 text-left text-xl font-semibold text-black"
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
                  </motion.button>
                ))}

                <motion.button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full py-4 text-left text-xl font-semibold text-red-500"
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* SEARCH DROPDOWN (floating, follow header) */}
      <AnimatePresence>
        {showSearchDropdown ? (
          <motion.div
            key="search-dropdown"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed left-0 right-0 top-16 z-60"
          >
            <div className="mx-auto max-w-7xl px-4">
              <div className="w-full md:max-w-lg">
                <div
                  ref={dropdownRef}
                  className="rounded-2xl border bg-white p-2 shadow-lg"
                >
                  {searchQuery.isLoading ? (
                    <div className="px-3 py-6 text-center text-sm text-brand-neutral-600">
                      Searching...
                    </div>
                  ) : null}

                  {!searchQuery.isLoading && searchBooks.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-brand-neutral-600">
                      No books found.
                    </div>
                  ) : null}

                  {!searchQuery.isLoading && searchBooks.length > 0 ? (
                    <div className="max-h-[60vh] overflow-auto">
                      <div className="space-y-2 p-1">
                        {searchBooks.map((b, idx) => {
                          const active = idx === activeIndex;

                          return (
                            <motion.button
                              key={b.id}
                              type="button"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => goToBookByIndex(idx)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={[
                                "w-full cursor-pointer rounded-xl p-2 text-left transition",
                                active ? "bg-zinc-100" : "hover:bg-zinc-50",
                              ].join(" ")}
                            >
                              <div className="flex gap-3">
                                <div className="h-16 w-12 overflow-hidden rounded-md bg-zinc-100">
                                  <img
                                    src={safeCoverSrc(b.coverImage)}
                                    alt={b.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-black">
                                    {b.title}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-brand-neutral-600">
                                    {b.author?.name ?? "Unknown author"}
                                  </p>

                                  <div className="mt-1 flex items-center gap-1 text-xs text-brand-neutral-600">
                                    <Image
                                      src="/Star.svg"
                                      alt="Star"
                                      width={14}
                                      height={14}
                                    />
                                    <span>{b.rating ?? 0}</span>
                                  </div>

                                  <p className="mt-1 text-xs text-brand-neutral-600">
                                    {b.publishedYear}
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
