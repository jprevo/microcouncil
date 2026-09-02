import { SaveRow } from "./SaveRow";
import { EmptyMessage } from "../ui/EmptyMessage";
import { useSaves } from "../../saves/useSaves";

export function SavesList({ onClose }: { readonly onClose: () => void }) {
  const { saves } = useSaves();

  return (
    <>
      <div className="modal__head">
        <h2 id="saves-title">📂 Vos conseils enregistrés</h2>
        <button
          className="modal__close"
          type="button"
          aria-label="Fermer"
          onClick={onClose}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="modal__body">
        {saves.length === 0 ? (
          <EmptyMessage>
            Rien d'enregistré pour l'instant. Le bouton « Sauvegarder », juste à
            gauche, range le conseil en cours.
          </EmptyMessage>
        ) : (
          <ul className="saves">
            {saves.map((save) => (
              <SaveRow key={save.id} save={save} onLoaded={onClose} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
