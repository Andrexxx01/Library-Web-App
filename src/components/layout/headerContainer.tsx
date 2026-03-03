"use client";

import Header from "@/components/layout/header";
import { useAppSelector } from "@/store/hooks";

export default function HeaderContainer() {
  const { token, user, isAuthenticated } = useAppSelector((s) => s.auth);

  // sementara cartCount masih 0 (nanti ambil dari cart query)
  const cartCount = 0;

  return (
    <Header
      cartCount={cartCount}
      isAuthenticated={isAuthenticated && !!token && !!user}
    />
  );
}
