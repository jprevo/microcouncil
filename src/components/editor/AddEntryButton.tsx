import { Emoji } from "../ui/Emoji";

interface AddEntryButtonProps {
  readonly label: string;
  readonly onClick: () => void;
}

/** Call to action at the foot of a list: create an entry from scratch. */
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
