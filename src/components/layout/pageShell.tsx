import type { ReactNode } from "react";

export default function PageShell({ children }: { children: ReactNode }) {
  return <div className="pt-16">{children}</div>;
}
