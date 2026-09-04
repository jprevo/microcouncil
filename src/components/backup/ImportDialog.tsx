import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Notice } from "../ui/Notice";
import { exportedInstant } from "../../backup/format";
import type { Backup } from "../../backup/format";
import { summarize } from "../../backup/summary";
import { useApplyBackup } from "../../backup/useApplyBackup";
import { formatDate } from "../../lib/text";
import { format, pluralize } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";

interface ImportDialogProps {
  /** The file, already validated: only its content is still to be confirmed. */
  readonly backup: Backup;
  readonly onClose: () => void;
}

/** The last word before an import wipes the browser clean and writes the file in. */
export function ImportDialog({ backup, onClose }: ImportDialogProps) {
  const apply = useApplyBackup();
  const { cards, saves } = summarize(backup.state, backup.saves);
  const at = exportedInstant(backup);
  const { bundle } = useLocale();
  const t = useT();

  const confirm = (): void => {
    apply(backup);
    onClose();
  };

  return (
    <ConfirmDialog
      id="import-title"
      title={t.backup.import.title}
      confirmLabel={t.backup.import.confirmLabel}
      onConfirm={confirm}
      onClose={onClose}
    >
      <p className="modal__lede">{t.backup.import.intro}</p>

      <section className="modal__section">
        <h3>{t.backup.import.sectionTitle}</h3>
        <ul className="modal__list">
          <li>
            {at === null
              ? t.backup.import.exportedAtUnknown
              : format(t.backup.import.exportedAt, {
                  date: formatDate(at, bundle.meta.numberLocale),
                  version: backup.version,
                })}
          </li>
          <li>
            {format(t.backup.import.cardsSavesLine, {
              cards,
              cardsWord: pluralize(cards, t.backup.cardsWord),
              saves,
              savesWord: pluralize(saves, t.backup.savesWord),
            })}
          </li>
          <li>{t.backup.import.settingsLine}</li>
        </ul>
      </section>

      {backup.locale !== "" && backup.locale !== bundle.meta.code ? (
        <Notice>
          {format(t.backup.import.localeMismatch, { locale: backup.locale })}
        </Notice>
      ) : null}

      <Notice>
        <strong>{t.backup.import.warningTitle}</strong>
        {t.backup.import.warning}
      </Notice>
    </ConfirmDialog>
  );
}
