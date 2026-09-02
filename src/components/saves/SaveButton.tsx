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
      {/* Monté seulement à l'ouverture : le nom proposé suit le sujet du moment. */}
      <Modal open={open} labelledBy="save-title" onClose={close}>
        {open ? <SaveDialog onClose={close} /> : null}
      </Modal>
    </>
  );
}
