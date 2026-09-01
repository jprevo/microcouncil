import type { ReactNode } from "react";

interface CardProps {
  readonly labelledBy: string;
  readonly children: ReactNode;
  readonly variant?: "output";
}

export function Card({ labelledBy, children, variant }: CardProps) {
  const className = variant === undefined ? "card" : `card card--${variant}`;
  return (
    <section className={className} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}
