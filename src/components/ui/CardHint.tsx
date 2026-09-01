import type { ReactNode } from "react";

export function CardHint({ children }: { readonly children: ReactNode }) {
  return <p className="card__hint">{children}</p>;
}
