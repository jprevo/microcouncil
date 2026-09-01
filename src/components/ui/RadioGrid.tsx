import type { KeyboardEventHandler, ReactNode } from "react";

interface RadioGridProps {
  readonly labelledBy: string;
  readonly onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  readonly children: ReactNode;
}

export function RadioGrid({ labelledBy, onKeyDown, children }: RadioGridProps) {
  return (
    <div
      className="grid grid--environments"
      role="radiogroup"
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}
