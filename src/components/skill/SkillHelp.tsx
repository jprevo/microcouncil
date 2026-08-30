import { useState } from 'react';
import { SkillGuide } from './SkillGuide';
import { Emoji } from '../ui/Emoji';
import { Modal } from '../ui/Modal';

export function SkillHelp() {
  const [open, setOpen] = useState(false);
  const close = (): void => setOpen(false);

  return (
    <>
      <button
        className="icon-button"
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Emoji glyph="🧩" />
        <span>Installer le skill</span>
      </button>
      <Modal open={open} labelledBy="skill-title" onClose={close}>
        <SkillGuide onClose={close} />
      </Modal>
    </>
  );
}
