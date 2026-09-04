import { DialogHead } from "./DialogHead";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { useT } from "../../locale/useT";

interface ConfirmDialogProps {
  /** Id of the heading a `Modal` points its `labelledBy` at. */
  readonly id: string;
  readonly title: string;
  /** Wording of the button that goes through with it — never a bare "OK". */
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
  /** What the user is being asked to confirm, spelled out. */
  readonly children: ReactNode;
}

/** A dialog that explains an action, then offers to cancel it or carry it out. */
export function ConfirmDialog({
  id,
  title,
  confirmLabel,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  const t = useT();
  return (
    <>
      <DialogHead id={id} title={title} onClose={onClose} />
      <div className="modal__body">{children}</div>
      <div className="modal__foot">
        <div className="modal__foot-left" />
        <div className="modal__foot-right">
          <Button variant="quiet" onClick={onClose}>
            {t.editor.cancel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
