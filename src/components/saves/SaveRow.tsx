import { formatDate } from "../../lib/text";
import { format, pluralize } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useSaves } from "../../saves/useSaves";
import { useAppDispatch } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CouncilSave } from "../../types";

/** Past this, the remaining emoji are counted rather than shown, so rows stay even. */
const ICON_LIMIT = 7;

interface SaveRowProps {
  readonly save: CouncilSave;
  readonly onLoaded: () => void;
}

export function SaveRow({ save, onLoaded }: SaveRowProps) {
  const dispatch = useAppDispatch();
  const { remove } = useSaves();
  const toast = useToast();
  const { numberLocale } = useLocale().bundle.meta;
  const t = useT();

  const icons = save.members.map((member) => member.item.icon);
  const shown = icons.slice(0, ICON_LIMIT);
  const hidden = icons.length - shown.length;
  const count = save.members.length;
  const meta = [
    `${count} ${pluralize(count, t.saves.membersCount, numberLocale)}`,
    save.environment?.item.title ?? null,
    formatDate(save.savedAt, numberLocale),
  ].filter((part): part is string => part !== null);

  const load = (): void => {
    dispatch({ type: "loadCouncil", council: save });
    toast(format(t.saves.loadedToast, { name: save.name }));
    onLoaded();
  };

  const drop = (): void => {
    if (!globalThis.confirm(format(t.saves.deleteConfirm, { name: save.name })))
      return;
    remove(save.id);
    toast(format(t.saves.deletedToast, { name: save.name }));
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
        aria-label={format(t.saves.deleteAria, { name: save.name })}
        onClick={drop}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </li>
  );
}
