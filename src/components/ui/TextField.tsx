interface TextFieldProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly type?: 'text' | 'search';
  readonly autoComplete?: string;
  readonly ariaLabel?: string;
  readonly modifier?: 'search';
}

export function TextField({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  ariaLabel,
  modifier,
}: TextFieldProps) {
  return (
    <input
      id={id}
      className={modifier === undefined ? 'field' : `field field--${modifier}`}
      type={type}
      value={value}
      autoComplete={autoComplete}
      aria-label={ariaLabel}
      spellCheck={false}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
