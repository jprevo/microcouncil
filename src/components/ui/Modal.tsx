import { useEffect, useRef } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

interface ModalProps {
  readonly open: boolean;
  readonly labelledBy: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

/** Native dialog: `<dialog>` provides both the focus trap and the blocking backdrop. */
export function Modal({ open, labelledBy, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // `showModal` focuses the first focusable element, often the close cross. A
      // dialog that names its own input field takes that choice back.
      const target = dialog.querySelector<HTMLElement>("[data-autofocus]");
      target?.focus();
      if (target instanceof HTMLInputElement) target.select();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // A click on the backdrop lands on the `dialog` element itself, never on the panel.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>): void => {
    if (event.target === event.currentTarget) onClose();
  };

  // Some embedded browsers never fire the native close request on Escape.
  const onEscape = (event: KeyboardEvent<HTMLDialogElement>): void => {
    if (event.key === "Escape") onClose();
  };

  return (
    <dialog
      className="modal"
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={onBackdropClick}
      onKeyDown={onEscape}
    >
      <div className="modal__panel">{children}</div>
    </dialog>
  );
}
