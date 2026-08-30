interface ToastProps {
  readonly message: string;
  readonly visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div className={visible ? 'toast is-visible' : 'toast'} role="status" aria-live="polite">
      {message}
    </div>
  );
}
