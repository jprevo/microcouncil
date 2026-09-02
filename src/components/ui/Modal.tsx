import { useEffect, useRef } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

interface ModalProps {
  readonly open: boolean;
  readonly labelledBy: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

/** Boîte de dialogue native : focus piégé et fond bloquant viennent de `<dialog>`. */
export function Modal({ open, labelledBy, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // `showModal` vise le premier élément focalisable — souvent la croix de
      // fermeture. Une boîte qui désigne son champ d'entrée reprend la main.
      const target = dialog.querySelector<HTMLElement>("[data-autofocus]");
      target?.focus();
      if (target instanceof HTMLInputElement) target.select();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Un clic sur l'arrière-plan vise l'élément `dialog` lui-même, jamais le panneau.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>): void => {
    if (event.target === ref.current) onClose();
  };

  // Certains navigateurs embarqués n'émettent pas la demande de fermeture native sur Échap.
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
