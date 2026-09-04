interface TileEditButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  /**
   * Shared with the tile it belongs to: the grid is one tab stop, and the pencil
   * of the tile currently holding it is the second — reachable by Tab alone,
   * with no shortcut to memorise.
   */
  readonly tabIndex?: number;
  readonly onFocus?: () => void;
}

/** Edit pencil, pinned in the corner of the tile. */
export function TileEditButton({
  label,
  onClick,
  tabIndex,
  onFocus,
}: TileEditButtonProps) {
  return (
    <button
      className="tile__edit"
      type="button"
      title={label}
      tabIndex={tabIndex}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={onClick}
      onFocus={onFocus}
    >
      <span aria-hidden="true">✎</span>
    </button>
  );
}
