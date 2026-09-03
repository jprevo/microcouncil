import type { ReactNode } from "react";
import { Button } from "../ui/Button";
import { Notice } from "../ui/Notice";
import { useToast } from "../../toast/useToast";
import type { CatalogOrigin, LibraryTarget } from "../../types";

interface EntryEditorProps {
  /** The entry being edited, or null when one is being created. */
  readonly entry: CatalogOrigin | null;
  readonly titleId: string;
  /** Dialog title when creating; when editing, the entry's own name is shown instead. */
  readonly createTitle: string;
  readonly error: string | null;
  readonly onDelete: (target: LibraryTarget) => void;
  readonly onRestore: (target: LibraryTarget) => void;
  readonly onSave: () => void;
  readonly onClose: () => void;
  /** The form fields, which differ from one catalog to the other. */
  readonly children: ReactNode;
}

/**
 * The shell every editor dialog shares: heading, fields, error and actions. Only
 * deleting and restoring depend on which catalog is being edited, and those come in
 * through `onDelete` and `onRestore`.
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

      {/* Outside the scrolling body: an error message has to stay in sight. */}
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
