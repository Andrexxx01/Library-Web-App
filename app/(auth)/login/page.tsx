"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/services/mutations/auth";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email (must include '@' and a domain).",
    ),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function sanitizeNext(nextUrl: string | null) {
  // Only allow internal paths to avoid open-redirect
  if (!nextUrl) return "/";
  if (!nextUrl.startsWith("/")) return "/";
  if (nextUrl.startsWith("//")) return "/";
  return nextUrl;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = sanitizeNext(searchParams.get("next"));
  const emailFromQuery = searchParams.get("email") || "";
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: emailFromQuery, password: "" },
  });

  const isLoading = useMemo(
    () => loginMutation.isPending || isSubmitting,
    [loginMutation.isPending, isSubmitting],
  );

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
      toast.success("Login successful.");
      router.replace(nextUrl);
    } catch (e: any) {
      toast.error(e?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-svh bg-white">
      <div className="mx-auto flex min-h-svh max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Image src="/Logo.svg" alt="Booky" width={22} height={22} />
            <span className="text-base font-semibold text-black">Booky</span>
          </div>

          <h1 className="mt-4 text-center text-xl font-semibold text-black md:text-left">
            Login
          </h1>
          <p className="mt-1 text-center text-xs text-brand-neutral-600 md:text-left">
            Sign in to manage your library account.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-black">Email</label>
              <input
                type="email"
                placeholder="johndoe@email.com"
                {...register("email")}
                className={[
                  "h-10 w-full rounded-md border bg-white px-3 text-sm outline-none",
                  errors.email
                    ? "border-pink-500 focus-visible:ring-2 focus-visible:ring-pink-500"
                    : "border-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-300",
                ].join(" ")}
              />
              {errors.email ? (
                <p className="text-[10px] text-pink-600">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-black">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={[
                    "h-10 w-full rounded-md border bg-white px-3 pr-10 text-sm outline-none",
                    errors.password
                      ? "border-pink-500 focus-visible:ring-2 focus-visible:ring-pink-500"
                      : "border-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-300",
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Image
                    src={showPassword ? "/eye-light.svg" : "/eye-off-light.svg"}
                    alt="Toggle password"
                    width={18}
                    height={18}
                  />
                </button>
              </div>

              {errors.password ? (
                <p className="text-[10px] text-pink-600">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {/* Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="h-10 w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </motion.div>

            <p className="text-center text-xs text-brand-neutral-700">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?next=${encodeURIComponent(nextUrl)}`}
                className="font-medium text-brand-primary-300 underline-offset-2 hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
