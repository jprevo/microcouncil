import type { Ref } from 'react';

interface TextAreaProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly rows: number;
  readonly modifier?: 'subject';
  readonly textareaRef?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ id, value, onChange, placeholder, rows, modifier, textareaRef }: TextAreaProps) {
  const className = ['field', 'field--area', modifier === undefined ? null : `field--${modifier}`]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      id={id}
      ref={textareaRef}
      className={className}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
