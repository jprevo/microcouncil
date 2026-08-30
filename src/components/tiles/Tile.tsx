import type { ReactNode, Ref } from 'react';
import { TileCheck } from './TileCheck';
import { TileIcon } from './TileIcon';

interface TileProps {
  readonly icon: string;
  readonly selected: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
  /** Vrai dans un `radiogroup` : la sélection est unique et la tabulation itinérante. */
  readonly radio?: boolean;
  readonly tabIndex?: number;
  readonly hint?: string;
  readonly buttonRef?: Ref<HTMLButtonElement>;
}

/** Coquille commune aux fiches : icône, corps, coche. */
export function Tile({ icon, selected, onClick, children, radio, tabIndex, hint, buttonRef }: TileProps) {
  return (
    <button
      ref={buttonRef}
      className="tile"
      type="button"
      title={hint}
      tabIndex={tabIndex}
      role={radio === true ? 'radio' : undefined}
      aria-checked={radio === true ? selected : undefined}
      aria-pressed={radio === true ? undefined : selected}
      onClick={onClick}
    >
      <TileIcon icon={icon} />
      <div className="tile__body">{children}</div>
      <TileCheck />
    </button>
  );
}
