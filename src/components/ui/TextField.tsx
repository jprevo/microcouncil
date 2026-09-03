interface TextFieldProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly type?: "text" | "search";
  readonly autoComplete?: string;
  readonly ariaLabel?: string;
  readonly modifier?: "search";
  /** Submit from the keyboard, for dialogs with a single field to fill in. */
  readonly onEnter?: () => void;
  /** The field its dialog focuses on opening, with the content pre-selected. */
  readonly autoFocus?: boolean;
}

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  ariaLabel,
  modifier,
  onEnter,
  autoFocus,
}: TextFieldProps) {
  return (
    <input
      id={id}
      className={modifier === undefined ? "field" : `field field--${modifier}`}
      type={type}
      value={value}
      autoComplete={autoComplete}
      aria-label={ariaLabel}
      spellCheck={false}
      placeholder={placeholder}
      data-autofocus={autoFocus === true ? "" : undefined}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && onEnter !== undefined) {
          event.preventDefault();
          onEnter();
        }
      }}
    />
  );
}
