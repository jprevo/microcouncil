import { useState } from "react";
import { ExportDialog } from "./ExportDialog";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);

  return (
    <>
      <IconButton
        glyph="📤"
        label="Exporter"
        ariaLabel="Exporter toutes mes données au format JSON"
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
