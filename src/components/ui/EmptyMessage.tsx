import type { ReactNode } from "react";

export function EmptyMessage({ children }: { readonly children: ReactNode }) {
  return <p className="empty">{children}</p>;
}
