interface IconButtonProps {
  readonly glyph: string;
  /** The visible label, and the accessible name unless overridden. */
  readonly label: string;
  /** Accessible name, for when it needs to say something other than the label. */
  readonly ariaLabel?: string;
  readonly onClick: () => void;
  /** Count shown after the label; zero shows nothing. */
  readonly count?: number;
  /** The label leaves the screen but is still announced: the icon carries it. */
  readonly iconOnly?: boolean;
  readonly hasPopup?: boolean;
  /** Announces the label changing, for a button that toggles. */
  readonly live?: boolean;
}

/** The pill used in the top bar and the footer: an icon, a label, sometimes a count. */
export function IconButton({
  glyph,
  label,
  ariaLabel,
  onClick,
  count,
  iconOnly,
  hasPopup,
  live,
}: IconButtonProps) {
  return (
    <button
      className={
        iconOnly === true ? "icon-button icon-button--bare" : "icon-button"
      }
      type="button"
      aria-label={ariaLabel ?? label}
      aria-haspopup={hasPopup === true ? "dialog" : undefined}
      aria-live={live === true ? "polite" : undefined}
      onClick={onClick}
    >
      <span aria-hidden="true">{glyph}</span>
      {iconOnly === true ? null : (
        <span className="icon-button__label">{label}</span>
      )}
      {count === undefined || count === 0 ? null : (
        <span className="icon-button__count">{count}</span>
      )}
    </button>
  );
}
