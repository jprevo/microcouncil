import type { ReactNode } from "react";

interface CardProps {
  readonly labelledBy: string;
  readonly children: ReactNode;
  readonly variant?: "output";
  /**
   * Set when a skip link aims at this card. The negative tab index goes with it:
   * following a fragment to a plain `<section>` moves the caret but not the
   * focus, so the next Tab would carry on from the top of the page instead of
   * from here — which would undo the point of the link.
   */
  readonly id?: string;
}

export function Card({ labelledBy, children, variant, id }: CardProps) {
  const className = variant === undefined ? "card" : `card card--${variant}`;
  return (
    <section
      className={className}
      id={id}
      tabIndex={id === undefined ? undefined : -1}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}
