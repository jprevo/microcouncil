import { EmojiPicker } from "./EmojiPicker";
import { Field } from "../ui/Field";

interface IconFieldProps {
  readonly id: string;
  readonly icon: string;
  readonly onPick: (icon: string) => void;
}

/** Le choix d'icône, identique dans tous les formulaires. */
export function IconField({ id, icon, onPick }: IconFieldProps) {
  return (
    <Field htmlFor={id} label="Icône">
      <EmojiPicker inputId={id} icon={icon} onPick={onPick} />
    </Field>
  );
}
