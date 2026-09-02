import { Emoji } from "../ui/Emoji";

interface AddEntryButtonProps {
  readonly label: string;
  readonly onClick: () => void;
}

/** Appel à l'action en bas d'une liste : créer une fiche de toutes pièces. */
export function AddEntryButton({ label, onClick }: AddEntryButtonProps) {
  return (
    <button
      className="add-entry"
      type="button"
      aria-haspopup="dialog"
      onClick={onClick}
    >
      <Emoji glyph="＋" /> {label}
    </button>
  );
}
