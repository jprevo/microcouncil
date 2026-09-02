import { useState } from "react";
import { SavesList } from "./SavesList";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { useSaves } from "../../saves/useSaves";

export function LoadButton() {
  const { saves } = useSaves();
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);

  return (
    <>
      <IconButton
        glyph="📂"
        label="Charger"
        ariaLabel={
          saves.length === 0
            ? "Charger un conseil enregistré"
            : `Charger un conseil enregistré (${saves.length})`
        }
        count={saves.length}
        hasPopup
        onClick={() => setOpen(true)}
      />
      <Modal open={open} labelledBy="saves-title" onClose={close}>
        <SavesList onClose={close} />
      </Modal>
    </>
  );
}
