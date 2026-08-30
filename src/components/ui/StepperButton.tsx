interface StepperButtonProps {
  readonly label: string;
  readonly glyph: string;
  readonly onClick: () => void;
}

export function StepperButton({ label, glyph, onClick }: StepperButtonProps) {
  return (
    <button className="stepper__btn" type="button" aria-label={label} onClick={onClick}>
      {glyph}
    </button>
  );
}
