import { useState } from "react";
import { SaveDialog } from "./SaveDialog";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";

export function SaveButton() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);

  return (
    <>
      <IconButton
        glyph="💾"
        label="Sauvegarder"
        ariaLabel="Sauvegarder ce conseil"
        hasPopup
        onClick={() => setOpen(true)}
      />
      {/* Mounted only once open, so the suggested name follows the current subject. */}
      <Modal open={open} labelledBy="save-title" onClose={close}>
        {open ? <SaveDialog onClose={close} /> : null}
      </Modal>
    </>
  );
}
