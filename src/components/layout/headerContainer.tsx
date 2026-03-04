"use client";

import Header from "@/components/layout/header";
import { useAppSelector } from "@/store/hooks";
import { useCartQuery } from "@/services/queries/cart";

export default function HeaderContainer() {
  const { token, user, isAuthenticated } = useAppSelector((s) => s.auth);
  const authed = !!token && !!user;
  const cartQuery = useCartQuery({ enabled: authed });
  const cartCount = cartQuery.data?.data?.itemCount ?? 0;

  return <Header cartCount={cartCount} isAuthenticated={authed} />;
}
