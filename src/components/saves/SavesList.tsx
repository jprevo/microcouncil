import { SaveRow } from "./SaveRow";
import { EmptyMessage } from "../ui/EmptyMessage";
import { DialogHead } from "../ui/DialogHead";
import { useSaves } from "../../saves/useSaves";

export function SavesList({ onClose }: { readonly onClose: () => void }) {
  const { saves } = useSaves();

  return (
    <>
      <DialogHead
        id="saves-title"
        title="📂 Vos conseils enregistrés"
        onClose={onClose}
      />

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
