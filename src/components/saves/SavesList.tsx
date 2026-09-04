import { SaveRow } from "./SaveRow";
import { EmptyMessage } from "../ui/EmptyMessage";
import { DialogHead } from "../ui/DialogHead";
import { useSaves } from "../../saves/useSaves";
import { useT } from "../../locale/useT";

export function SavesList({ onClose }: { readonly onClose: () => void }) {
  const { saves } = useSaves();
  const t = useT();

  return (
    <>
      <DialogHead id="saves-title" title={t.saves.title} onClose={onClose} />

      <div className="modal__body">
        {saves.length === 0 ? (
          <EmptyMessage>{t.saves.empty}</EmptyMessage>
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
