import { ConfirmDialog } from "../ui/ConfirmDialog";
import { summarize } from "../../backup/summary";
import { useExportBackup } from "../../backup/useExportBackup";
import { plural } from "../../lib/text";
import { useSaves } from "../../saves/useSaves";
import { useAppState } from "../../state/hooks";

/** Says what the file will hold and where it goes, before anything is written. */
export function ExportDialog({ onClose }: { readonly onClose: () => void }) {
  const state = useAppState();
  const { saves } = useSaves();
  const exportBackup = useExportBackup();
  const { cards, saves: savedCount } = summarize(state, saves);

  const confirm = (): void => {
    exportBackup();
    onClose();
  };

  const cardsLine =
    cards === 0
      ? "Les fiches que vous créerez ou modifierez — aucune pour l'instant."
      : `${String(cards)} ${plural(cards, "fiche")} de membre ou d'environnement ${plural(cards, "créée")} ou ${plural(cards, "modifiée")}.`;

  const savesLine =
    savedCount === 0
      ? "Vos conseils enregistrés — aucun pour l'instant."
      : `${String(savedCount)} ${plural(savedCount, "conseil")} ${plural(savedCount, "enregistré")}, avec les fiches sur lesquelles ${plural(savedCount, "il")} ${plural(savedCount, "repose", "nt")}.`;

  return (
    <ConfirmDialog
      id="export-title"
      title="📤 Exporter vos données"
      confirmLabel="Télécharger le fichier"
      onConfirm={confirm}
      onClose={onClose}
    >
      <p className="modal__lede">
        Par défaut, Micro Council garde tout dans votre navigateur : vider son
        stockage, changer de machine ou de navigateur, vous fait perdre toutes
        vos données. L'export vous permet d'avoir une sauvegarde globale dans un
        seul fichier, que vous pouvez conserver et réimporter plus tard.
      </p>

      <section className="modal__section">
        <h3>Ce que le fichier emporte</h3>
        <ul className="modal__list">
          <li>Votre nom, vos instructions, le sujet en cours, la sélection.</li>
          <li>{cardsLine}</li>
          <li>{savesLine}</li>
        </ul>
      </section>
    </ConfirmDialog>
  );
}
