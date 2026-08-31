interface TileEditButtonProps {
  readonly label: string;
  readonly onClick: () => void;
}

/** Crayon d'édition, épinglé dans le coin de la fiche. */
export function TileEditButton({ label, onClick }: TileEditButtonProps) {
  return (
    <button
      className="tile__edit"
      type="button"
      title={label}
      aria-label={label}
      aria-haspopup="dialog"
      onClick={onClick}
    >
      <span aria-hidden="true">✎</span>
    </button>
  );
}
