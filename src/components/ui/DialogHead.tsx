interface DialogHeadProps {
  /** Id of the heading a `Modal` points its `labelledBy` at. */
  readonly id: string;
  /** Heading text, emoji included: it reads as one line. */
  readonly title: string;
  readonly onClose: () => void;
}

/** The title bar every dialog wears: a heading, and the cross that closes it. */
export function DialogHead({ id, title, onClose }: DialogHeadProps) {
  return (
    <div className="modal__head">
      <h2 id={id}>{title}</h2>
      <button
        className="modal__close"
        type="button"
        aria-label="Fermer"
        onClick={onClose}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
