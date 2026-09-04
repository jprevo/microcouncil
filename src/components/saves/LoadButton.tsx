import { useState } from "react";
import { SavesList } from "./SavesList";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { useSaves } from "../../saves/useSaves";
import { format } from "../../locale/i18n";
import { useT } from "../../locale/useT";

export function LoadButton() {
  const { saves } = useSaves();
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);
  const t = useT();

  return (
    <>
      <IconButton
        glyph="📂"
        label={t.topbar.load}
        ariaLabel={
          saves.length === 0
            ? t.topbar.loadAria
            : format(t.topbar.loadAriaWithCount, { count: saves.length })
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
