import { formatDate, plural } from "../../lib/text";
import { useSaves } from "../../saves/useSaves";
import { useAppDispatch } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CouncilSave } from "../../types";

/** Au-delà, les emoji restants sont comptés plutôt qu'affichés : les lignes restent régulières. */
const ICON_LIMIT = 7;

interface SaveRowProps {
  readonly save: CouncilSave;
  readonly onLoaded: () => void;
}

export function SaveRow({ save, onLoaded }: SaveRowProps) {
  const dispatch = useAppDispatch();
  const { remove } = useSaves();
  const toast = useToast();

  const icons = save.members.map((member) => member.item.icon);
  const shown = icons.slice(0, ICON_LIMIT);
  const hidden = icons.length - shown.length;
  const count = save.members.length;
  const meta = [
    `${count} ${plural(count, "membre")}`,
    save.environment?.item.title ?? null,
    formatDate(save.savedAt),
  ].filter((part): part is string => part !== null);

  const load = (): void => {
    dispatch({ type: "loadCouncil", council: save });
    toast(`« ${save.name} » est chargé`);
    onLoaded();
  };

  const drop = (): void => {
    if (!globalThis.confirm(`Supprimer définitivement « ${save.name} » ?`))
      return;
    remove(save.id);
    toast(`« ${save.name} » est supprimé`);
  };

  return (
    <li className="save">
      <button className="save__load" type="button" onClick={load}>
        <span className="save__icons" aria-hidden="true">
          {shown.map((icon, index) => (
            <span key={`${icon}-${index}`}>{icon}</span>
          ))}
          {hidden > 0 ? <span className="save__more">+{hidden}</span> : null}
        </span>
        <span className="save__body">
          <span className="save__name">{save.name}</span>
          <span className="save__meta">{meta.join(" · ")}</span>
        </span>
      </button>
      <button
        className="save__delete"
        type="button"
        aria-label={`Supprimer ${save.name}`}
        onClick={drop}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </li>
  );
}
