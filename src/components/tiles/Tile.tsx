import type { ReactNode, Ref } from "react";
import { TileIcon } from "./TileIcon";

interface TileProps {
  readonly icon: string;
  readonly selected: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
  /** True inside a `radiogroup`: the selection is single, and tab focus roams. */
  readonly radio?: boolean;
  readonly tabIndex?: number;
  readonly hint?: string;
  readonly buttonRef?: Ref<HTMLButtonElement>;
}

/** The shell every tile shares: an icon and a body. Selection shows in the frame. */
export function Tile({
  icon,
  selected,
  onClick,
  children,
  radio,
  tabIndex,
  hint,
  buttonRef,
}: TileProps) {
  return (
    <button
      ref={buttonRef}
      className="tile"
      type="button"
      title={hint}
      tabIndex={tabIndex}
      role={radio === true ? "radio" : undefined}
      aria-checked={radio === true ? selected : undefined}
      aria-pressed={radio === true ? undefined : selected}
      onClick={onClick}
    >
      <TileIcon icon={icon} />
      <div className="tile__body">{children}</div>
    </button>
  );
}
