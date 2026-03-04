"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/services/mutations/auth";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    email: z
      .string()
      .min(1, "Email is required.")
      .refine(
        (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "Please enter a valid email (must include '@' and a domain).",
      ),
    phone: z.string().min(1, "Phone is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((val) => val.password === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password and confirm password didn't match.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = useMemo(
    () => registerMutation.isPending || isSubmitting,
    [registerMutation.isPending, isSubmitting],
  );

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values);
      toast.success("Registration successful. Please log in.");
      router.replace(`/login?email=${encodeURIComponent(values.email)}`);
    } catch (e: any) {
      toast.error(e?.message || "Registration failed. Please try again.");
    }
  };

  const inputBase =
    "h-10 w-full rounded-md border bg-white px-3 text-sm outline-none";
  const inputOk =
    "border-brand-neutral-200 focus-visible:ring-2 focus-visible:ring-brand-primary-300";
  const inputErr =
    "border-pink-500 focus-visible:ring-2 focus-visible:ring-pink-500";

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
            Register
          </h1>
          <p className="mt-1 text-center text-xs text-brand-neutral-600 md:text-left">
            Create your account to start borrowing books.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-black">Name</label>
              <input
                type="text"
                placeholder=""
                {...register("name")}
                className={[inputBase, errors.name ? inputErr : inputOk].join(
                  " ",
                )}
              />
              {errors.name ? (
                <p className="text-[10px] text-pink-600">
                  {errors.name.message}
                </p>
              ) : null}
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-black">Email</label>
              <input
                type="email"
                placeholder=""
                {...register("email")}
                className={[inputBase, errors.email ? inputErr : inputOk].join(
                  " ",
                )}
              />
              {errors.email ? (
                <p className="text-[10px] text-pink-600">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            {/* Nomor Handphone */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-black">
                Nomor Handphone
              </label>
              <input
                type="tel"
                placeholder=""
                {...register("phone")}
                className={[inputBase, errors.phone ? inputErr : inputOk].join(
                  " ",
                )}
              />
              {errors.phone ? (
                <p className="text-[10px] text-pink-600">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-black">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  {...register("password")}
                  className={[
                    inputBase,
                    "pr-10",
                    errors.password ? inputErr : inputOk,
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
            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-black">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder=""
                  {...register("confirmPassword")}
                  className={[
                    inputBase,
                    "pr-10",
                    errors.confirmPassword ? inputErr : inputOk,
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <Image
                    src={
                      showConfirmPassword
                        ? "/eye-light.svg"
                        : "/eye-off-light.svg"
                    }
                    alt="Toggle confirm password"
                    width={18}
                    height={18}
                  />
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-[10px] text-pink-600">
                  {errors.confirmPassword.message}
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
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </motion.div>
            <p className="text-center text-xs text-brand-neutral-700">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-brand-primary-300 underline-offset-2 hover:underline"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
