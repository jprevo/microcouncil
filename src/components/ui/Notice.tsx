import type { ReactNode } from "react";

export function Notice({ children }: { readonly children: ReactNode }) {
  return <div className="notice">{children}</div>;
}
