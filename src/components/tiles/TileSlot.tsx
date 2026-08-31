import type { ReactNode } from 'react';

interface TileSlotProps {
  readonly children: ReactNode;
  /** Contrôle superposé à la fiche : un bouton ne peut pas en contenir un autre. */
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
