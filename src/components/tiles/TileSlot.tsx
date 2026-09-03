import type { ReactNode } from "react";

interface TileSlotProps {
  readonly children: ReactNode;
  /** Control laid over the tile: a button cannot be nested inside another one. */
  readonly action: ReactNode;
}

export function TileSlot({ children, action }: TileSlotProps) {
  return (
    <div className="tile-slot">
      {children}
      {action}
    </div>
  );
}
