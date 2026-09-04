import { useState } from "react";
import { ExportDialog } from "./ExportDialog";
import { Modal } from "../ui/Modal";
import { useT } from "../../locale/useT";

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);
  const t = useT();

  return (
    <>
      <button
        type="button"
        className="footer-link"
        aria-label={t.backup.export.buttonAria}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {t.backup.export.button}
      </button>
      {/* Mounted only once open, so the counts it announces are the current ones. */}
      <Modal open={open} labelledBy="export-title" onClose={close}>
        {open ? <ExportDialog onClose={close} /> : null}
      </Modal>
    </>
  );
}
