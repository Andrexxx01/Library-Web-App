"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ChooseRolePage() {
  return (
    <div className="min-h-svh bg-white">
      <div className="mx-auto flex min-h-svh max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-brand-neutral-200 bg-white p-6 shadow-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Image src="/Logo.svg" alt="Booky" width={28} height={28} />
            <span className="text-xl font-bold text-black">Booky</span>
          </div>

          <h1 className="mt-6 text-center text-2xl font-semibold text-black">
            Choose how you want to sign in
          </h1>
          <p className="mt-2 text-center text-sm text-brand-neutral-600">
            Select your role to continue. You can always switch later.
          </p>

          <div className="mt-6 grid gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="h-12 w-full rounded-full" asChild>
                <Link href="/login">Sign in as User</Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="h-12 w-full rounded-full"
                asChild
              >
                <Link href="/admin/login">Sign in as Admin</Link>
              </Button>
            </motion.div>
          </div>

          <p className="mt-6 text-center text-xs text-brand-neutral-500">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
