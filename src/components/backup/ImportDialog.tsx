import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Notice } from "../ui/Notice";
import { exportedInstant } from "../../backup/format";
import type { Backup } from "../../backup/format";
import { summarize } from "../../backup/summary";
import { useApplyBackup } from "../../backup/useApplyBackup";
import { formatDate, plural } from "../../lib/text";

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

  const confirm = (): void => {
    apply(backup);
    onClose();
  };

  return (
    <ConfirmDialog
      id="import-title"
      title="📥 Importer des données"
      confirmLabel="Remplacer mes données"
      onConfirm={confirm}
      onClose={onClose}
    >
      <p className="modal__lede">
        Ce fichier est lisible, et voici ce qu'il contient. Rien n'est encore
        écrit : c'est le bouton ci-dessous qui décide.
      </p>

      <section className="modal__section">
        <h3>Le fichier</h3>
        <ul className="modal__list">
          <li>
            {at === null
              ? "Exporté à une date illisible."
              : `Exporté le ${formatDate(at)}, au format version ${String(backup.version)}.`}
          </li>
          <li>
            {`${String(cards)} ${plural(cards, "fiche")} de membre ou d'environnement, et ${String(saves)} ${plural(saves, "conseil")} ${plural(saves, "enregistré")}.`}
          </li>
          <li>
            Le nom, les instructions, le sujet, la sélection et le thème qui
            étaient les vôtres ce jour-là.
          </li>
        </ul>
      </section>

      <Notice>
        <strong>Tout ce que contient ce navigateur sera écrasé</strong> : votre
        nom, vos réglages, vos fiches et vos conseils enregistrés cèdent la
        place à ceux du fichier. L'opération est irréversible — au besoin,
        exportez vos données actuelles avant de continuer.
      </Notice>
    </ConfirmDialog>
  );
}
