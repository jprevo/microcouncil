import { Emoji } from "../ui/Emoji";

/** Appel à l'action en bas de la liste : créer un membre de toutes pièces. */
export function AddMemberButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      className="add-member"
      type="button"
      aria-haspopup="dialog"
      onClick={onClick}
    >
      <Emoji glyph="＋" /> Ajouter un membre
    </button>
  );
}
