import { useState } from "react";
import { SkillGuide } from "./SkillGuide";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";

export function SkillHelp() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);

  return (
    <>
      <IconButton
        glyph="🧩"
        label="Installer le skill"
        hasPopup
        onClick={() => setOpen(true)}
      />
      <Modal open={open} labelledBy="skill-title" onClose={close}>
        <SkillGuide onClose={close} />
      </Modal>
    </>
  );
}
