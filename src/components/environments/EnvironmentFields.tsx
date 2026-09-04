import { IconField } from "../editor/IconField";
import { Field } from "../ui/Field";
import { TextArea } from "../ui/TextArea";
import { TextField } from "../ui/TextField";
import { useT } from "../../locale/useT";
import type { EnvironmentDraft } from "../../lib/environmentDraft";

interface EnvironmentFieldsProps {
  readonly draft: EnvironmentDraft;
  readonly onChange: (patch: Partial<EnvironmentDraft>) => void;
}

/** The fields of a setting entry, with no saving logic of their own. */
export function EnvironmentFields({ draft, onChange }: EnvironmentFieldsProps) {
  const t = useT();
  const f = t.environments.fields;

  return (
    <>
      <Field htmlFor="environment-title" label={f.title}>
        <TextField
          id="environment-title"
          value={draft.title}
          onChange={(title) => onChange({ title })}
          placeholder={f.titlePlaceholder}
        />
      </Field>

      <IconField
        id="environment-icon"
        icon={draft.icon}
        onPick={(icon) => onChange({ icon })}
      />

      <Field
        htmlFor="environment-summary"
        label={f.summary}
        hint={f.summaryHint}
      >
        <TextArea
          id="environment-summary"
          rows={1}
          value={draft.summary}
          onChange={(summary) => onChange({ summary })}
          placeholder={f.summaryPlaceholder}
        />
      </Field>

      <Field
        htmlFor="environment-description"
        label={f.description}
        hint={f.descriptionHint}
      >
        <TextArea
          id="environment-description"
          rows={4}
          value={draft.description}
          onChange={(description) => onChange({ description })}
          placeholder={f.descriptionPlaceholder}
        />
      </Field>
    </>
  );
}
