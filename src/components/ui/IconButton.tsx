interface IconButtonProps {
  readonly glyph: string;
  /** Libellé visible, et nom accessible par défaut. */
  readonly label: string;
  /** Nom accessible, lorsqu'il doit dire autre chose que le libellé. */
  readonly ariaLabel?: string;
  readonly onClick: () => void;
  /** Décompte affiché après le libellé ; zéro n'affiche rien. */
  readonly count?: number;
  /** Le libellé quitte l'écran mais reste annoncé : l'icône se suffit. */
  readonly iconOnly?: boolean;
  readonly hasPopup?: boolean;
  /** Annonce le changement de libellé, pour un bouton qui bascule. */
  readonly live?: boolean;
}

/** Pilule de la barre du haut et du pied de page : une icône, un libellé, parfois un compte. */
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
