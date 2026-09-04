import { useState } from "react";
import { SaveDialog } from "./SaveDialog";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { useT } from "../../locale/useT";

export function SaveButton() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);
  const t = useT();

  return (
    <>
      <IconButton
        glyph="💾"
        label={t.topbar.save}
        ariaLabel={t.topbar.saveAria}
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
