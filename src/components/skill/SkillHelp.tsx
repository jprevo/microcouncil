import { useState } from "react";
import { SkillGuide } from "./SkillGuide";
import { IconButton } from "../ui/IconButton";
import { Modal } from "../ui/Modal";
import { useT } from "../../locale/useT";

export function SkillHelp() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);
  const t = useT();

  return (
    <>
      <IconButton
        glyph="🧩"
        label={t.skill.button}
        hasPopup
        onClick={() => setOpen(true)}
      />
      <Modal open={open} labelledBy="skill-title" onClose={close}>
        <SkillGuide onClose={close} />
      </Modal>
    </>
  );
}
