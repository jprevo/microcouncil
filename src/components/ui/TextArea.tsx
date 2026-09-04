import type { Ref } from "react";

interface TextAreaProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly rows: number;
  readonly modifier?: "subject";
  readonly textareaRef?: Ref<HTMLTextAreaElement>;
  /**
   * For the areas whose label is the card heading above them rather than a
   * `<label>` of their own. A placeholder is not a name: it leaves the field the
   * moment anything is typed, and half the screen readers never announce it.
   */
  readonly ariaLabel?: string;
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows,
  modifier,
  textareaRef,
  ariaLabel,
}: TextAreaProps) {
  const className = [
    "field",
    "field--area",
    modifier === undefined ? null : `field--${modifier}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea
      id={id}
      ref={textareaRef}
      className={className}
      rows={rows}
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
