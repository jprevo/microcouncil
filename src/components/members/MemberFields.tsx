import { IconField } from "../editor/IconField";
import { Field } from "../ui/Field";
import { TextArea } from "../ui/TextArea";
import { TextField } from "../ui/TextField";
import { useT } from "../../locale/useT";
import type { MemberDraft } from "../../lib/memberDraft";

interface MemberFieldsProps {
  readonly draft: MemberDraft;
  readonly onChange: (patch: Partial<MemberDraft>) => void;
}

/** The fields of a member entry, with no saving logic of their own. */
export function MemberFields({ draft, onChange }: MemberFieldsProps) {
  const t = useT();
  const f = t.members.fields;

  return (
    <>
      <Field htmlFor="member-name" label={f.name}>
        <TextField
          id="member-name"
          value={draft.name}
          onChange={(name) => onChange({ name })}
          placeholder={f.namePlaceholder}
        />
      </Field>

      <Field htmlFor="member-job" label={f.job}>
        <TextField
          id="member-job"
          value={draft.job}
          onChange={(job) => onChange({ job })}
          placeholder={f.jobPlaceholder}
        />
      </Field>

      <IconField
        id="member-icon"
        icon={draft.icon}
        onPick={(icon) => onChange({ icon })}
      />

      <Field
        htmlFor="member-description"
        label={f.description}
        hint={f.descriptionHint}
      >
        <TextArea
          id="member-description"
          rows={3}
          value={draft.description}
          onChange={(description) => onChange({ description })}
          placeholder={f.descriptionPlaceholder}
        />
      </Field>

      <Field htmlFor="member-traits" label={f.traits} hint={f.traitsHint}>
        <TextField
          id="member-traits"
          value={draft.traits}
          onChange={(traits) => onChange({ traits })}
          placeholder={f.traitsPlaceholder}
        />
      </Field>

      <Field htmlFor="member-tags" label={f.tags} hint={f.tagsHint}>
        <TextField
          id="member-tags"
          value={draft.tags}
          onChange={(tags) => onChange({ tags })}
          placeholder={f.tagsPlaceholder}
        />
      </Field>
    </>
  );
}
