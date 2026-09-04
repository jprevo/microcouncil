import { useState } from "react";
import { ExportDialog } from "./ExportDialog";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { useT } from "../../locale/useT";

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);
  const t = useT();

  return (
    <>
      <IconButton
        glyph="📤"
        label={t.backup.export.button}
        ariaLabel={t.backup.export.buttonAria}
        hasPopup
        onClick={() => setOpen(true)}
      />
      {/* Mounted only once open, so the counts it announces are the current ones. */}
      <Modal open={open} labelledBy="export-title" onClose={close}>
        {open ? <ExportDialog onClose={close} /> : null}
      </Modal>
    </>
  );
}
