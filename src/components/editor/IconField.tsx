import { EmojiPicker } from "./EmojiPicker";
import { Field } from "../ui/Field";
import { useT } from "../../locale/useT";

interface IconFieldProps {
  readonly id: string;
  readonly icon: string;
  readonly onPick: (icon: string) => void;
}

/** The icon picker, identical in every form. */
export function IconField({ id, icon, onPick }: IconFieldProps) {
  const t = useT();
  return (
    <Field htmlFor={id} label={t.icon.label}>
      <EmojiPicker inputId={id} icon={icon} onPick={onPick} />
    </Field>
  );
}
