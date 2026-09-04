import type { KeyboardEventHandler, ReactNode } from "react";

interface GridProps {
  readonly variant: "members" | "environments";
  readonly children: ReactNode;
  /** Set when the grid is a composite widget the arrow keys walk. */
  readonly role?: "toolbar";
  readonly labelledBy?: string;
  readonly onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export function Grid({
  variant,
  children,
  role,
  labelledBy,
  onKeyDown,
}: GridProps) {
  return (
    <div
      className={`grid grid--${variant}`}
      role={role}
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}
