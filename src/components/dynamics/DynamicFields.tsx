import { IconField } from "../editor/IconField";
import { Field } from "../ui/Field";
import { TextArea } from "../ui/TextArea";
import { TextField } from "../ui/TextField";
import { useT } from "../../locale/useT";
import type { DynamicDraft } from "../../lib/dynamicDraft";

interface DynamicFieldsProps {
  readonly draft: DynamicDraft;
  readonly onChange: (patch: Partial<DynamicDraft>) => void;
}

/** The fields of a group-dynamic entry, with no saving logic of their own. */
export function DynamicFields({ draft, onChange }: DynamicFieldsProps) {
  const t = useT();
  const f = t.dynamics.fields;

  return (
    <>
      <Field htmlFor="dynamic-title" label={f.title}>
        <TextField
          id="dynamic-title"
          value={draft.title}
          onChange={(title) => onChange({ title })}
          placeholder={f.titlePlaceholder}
        />
      </Field>

      <IconField
        id="dynamic-icon"
        icon={draft.icon}
        onPick={(icon) => onChange({ icon })}
      />

      <Field htmlFor="dynamic-summary" label={f.summary} hint={f.summaryHint}>
        <TextArea
          id="dynamic-summary"
          rows={1}
          value={draft.summary}
          onChange={(summary) => onChange({ summary })}
          placeholder={f.summaryPlaceholder}
        />
      </Field>

      <Field
        htmlFor="dynamic-description"
        label={f.description}
        hint={f.descriptionHint}
      >
        <TextArea
          id="dynamic-description"
          rows={4}
          value={draft.description}
          onChange={(description) => onChange({ description })}
          placeholder={f.descriptionPlaceholder}
        />
      </Field>
    </>
  );
}
