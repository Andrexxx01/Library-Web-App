"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const socials = [
  { name: "Facebook", icon: "/Facebook.svg", href: "#" },
  { name: "Instagram", icon: "/Instagram.svg", href: "#" },
  { name: "LinkedIn", icon: "/LinkedIn.svg", href: "#" },
  { name: "Tiktok", icon: "/Tiktok.svg", href: "#" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/Logo.svg"
              alt="Booky logo"
              width={34}
              height={34}
              priority
            />
            <span className="text-2xl font-bold text-black md:text-3xl">
              Booky
            </span>
          </div>

          {/* Description */}
          <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-600 md:mt-6 md:text-base md:leading-7">
            Discover inspiring stories & timeless knowledge, ready to borrow
            anytime. Explore online or visit our nearest library branch.
          </p>

          {/* Follow */}
          <p className="mt-10 text-sm font-semibold text-black md:mt-12 md:text-base">
            Follow on Social Media
          </p>

          {/* Social icons */}
          <div className="mt-5 flex items-center gap-4 md:mt-6">
            {socials.map((s) => (
              <motion.a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
              >
                <Image src={s.icon} alt={s.name} width={20} height={20} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
