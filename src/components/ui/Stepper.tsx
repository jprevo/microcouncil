import { StepperButton } from './StepperButton';

interface StepperProps {
  readonly label: string;
  readonly inputLabel: string;
  readonly value: string;
  readonly max: number;
  readonly onDraft: (value: string) => void;
  readonly onCommit: () => void;
  readonly onNudge: (delta: number) => void;
}

export function Stepper({ label, inputLabel, value, max, onDraft, onCommit, onNudge }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <StepperButton label="Diminuer" glyph="−" onClick={() => onNudge(-1)} />
      <input
        className="stepper__input"
        type="number"
        min={1}
        max={max}
        step={1}
        inputMode="numeric"
        aria-label={inputLabel}
        value={value}
        onChange={(event) => onDraft(event.target.value)}
        onBlur={onCommit}
      />
      <StepperButton label="Augmenter" glyph="+" onClick={() => onNudge(1)} />
    </div>
  );
}
