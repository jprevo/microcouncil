import type { ReactNode } from "react";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { useToast } from "../../toast/useToast";
import type { CatalogOrigin, LibraryTarget } from "../../types";

interface EntryEditorProps {
  /** La fiche modifiée, ou null lorsqu'il s'agit d'une création. */
  readonly entry: CatalogOrigin | null;
  readonly titleId: string;
  /** Titre de la boîte en création ; une modification affiche le nom de la fiche. */
  readonly createTitle: string;
  readonly error: string | null;
  readonly onDelete: (target: LibraryTarget) => void;
  readonly onRestore: (target: LibraryTarget) => void;
  readonly onSave: () => void;
  readonly onClose: () => void;
  /** Les champs du formulaire, propres à chaque domaine. */
  readonly children: ReactNode;
}

/**
 * Coquille commune aux boîtes d'édition : en-tête, champs, erreur et actions.
 * Seules la suppression et la restauration dépendent du domaine, et arrivent
 * par `onDelete` et `onRestore`.
 */
export function EntryEditor({
  entry,
  titleId,
  createTitle,
  error,
  onDelete,
  onRestore,
  onSave,
  onClose,
  children,
}: EntryEditorProps) {
  const toast = useToast();

  const remove = (): void => {
    if (entry === null) return;
    if (!globalThis.confirm(`Supprimer définitivement ${entry.label} ?`))
      return;
    onDelete(entry.target);
    toast(`${entry.label} quitte le catalogue`);
    onClose();
  };

  const restore = (): void => {
    if (entry === null) return;
    onRestore(entry.target);
    toast("Version d’origine rétablie");
    onClose();
  };

  return (
    <>
      <div className="modal__head">
        <h2 id={titleId}>
          {entry === null ? createTitle : `✏️ ${entry.label}`}
        </h2>
        <button
          className="modal__close"
          type="button"
          aria-label="Fermer"
          onClick={onClose}
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="modal__body modal__body--form">{children}</div>

      {/* Hors du corps défilant : un message d'erreur doit rester sous les yeux. */}
      {error === null ? null : (
        <div className="modal__error" role="alert">
          <Notice>{error}</Notice>
        </div>
      )}

      <div className="modal__foot">
        <div className="modal__foot-left">
          {entry?.target.kind === "custom" ? (
            <Button variant="quiet" onClick={remove}>
              Supprimer
            </Button>
          ) : null}
          {entry?.edited === true ? (
            <Button variant="quiet" onClick={restore}>
              Revenir à l'original
            </Button>
          ) : null}
        </div>
        <div className="modal__foot-right">
          <Button variant="quiet" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={onSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  );
}
