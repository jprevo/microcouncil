import { ConfirmDialog } from "../ui/ConfirmDialog";
import { summarize } from "../../backup/summary";
import { useExportBackup } from "../../backup/useExportBackup";
import { format, pluralizeZero } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useSaves } from "../../saves/useSaves";
import { useAppState } from "../../state/hooks";

/** Says what the file will hold and where it goes, before anything is written. */
export function ExportDialog({ onClose }: { readonly onClose: () => void }) {
  const state = useAppState();
  const { saves } = useSaves();
  const exportBackup = useExportBackup();
  const { cards, saves: savedCount } = summarize(state, saves);
  const { numberLocale } = useLocale().bundle.meta;
  const t = useT();

  const confirm = (): void => {
    exportBackup();
    onClose();
  };

  const cardsLine = format(
    pluralizeZero(cards, t.backup.export.cardsLine, numberLocale),
    { count: cards },
  );
  const savesLine = format(
    pluralizeZero(savedCount, t.backup.export.savesLine, numberLocale),
    { count: savedCount },
  );

  return (
    <ConfirmDialog
      id="export-title"
      title={t.backup.export.title}
      confirmLabel={t.backup.export.confirmLabel}
      onConfirm={confirm}
      onClose={onClose}
    >
      <p className="modal__lede">{t.backup.export.intro}</p>

      <section className="modal__section">
        <h3>{t.backup.export.sectionTitle}</h3>
        <ul className="modal__list">
          <li>{t.backup.export.settingsLine}</li>
          <li>{cardsLine}</li>
          <li>{savesLine}</li>
        </ul>
      </section>
    </ConfirmDialog>
  );
}
