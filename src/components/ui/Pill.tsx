import type { ReactNode } from "react";

interface PillProps {
  readonly children: ReactNode;
  readonly tone?: "soft";
}

export function Pill({ children, tone }: PillProps) {
  return (
    <span className={tone === undefined ? "pill" : `pill pill--${tone}`}>
      {children}
    </span>
  );
}
