import type { ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "quiet";

interface ButtonProps {
  readonly variant: ButtonVariant;
  readonly onClick: () => void;
  readonly children: ReactNode;
  /** Classe d'état additionnelle, par exemple `is-done`. */
  readonly state?: string;
}

export function Button({ variant, onClick, children, state }: ButtonProps) {
  const className = ["button", `button--${variant}`, state]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={className} type="button" onClick={onClick}>
      {children}
    </button>
  );
}
