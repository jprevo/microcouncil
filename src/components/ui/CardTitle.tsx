import type { ReactNode } from "react";

interface CardTitleProps {
  readonly id: string;
  readonly children: ReactNode;
}

export function CardTitle({ id, children }: CardTitleProps) {
  return <h2 id={id}>{children}</h2>;
}
