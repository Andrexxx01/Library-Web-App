"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

type Props = { children: React.ReactNode };

export default function PublicOnlyGuard({ children }: Props) {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAppSelector((s) => s.auth);

  const loggedIn = Boolean(isAuthenticated && token && user);

  useEffect(() => {
    if (loggedIn) router.replace("/");
  }, [loggedIn, router]);

  // kalau sudah login, jangan render halaman login/register
  if (loggedIn) return null;

  return <>{children}</>;
}
