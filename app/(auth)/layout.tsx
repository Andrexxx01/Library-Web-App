import PublicOnlyGuard from "@/components/guards/publicOnlyGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicOnlyGuard>{children}</PublicOnlyGuard>;
}
