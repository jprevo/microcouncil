import { IconField } from "../editor/IconField";
import { Field } from "../ui/Field";
import { TextArea } from "../ui/TextArea";
import { TextField } from "../ui/TextField";
import type { MemberDraft } from "../../lib/memberDraft";

interface MemberFieldsProps {
  readonly draft: MemberDraft;
  readonly onChange: (patch: Partial<MemberDraft>) => void;
}

/** The fields of a member entry, with no saving logic of their own. */
export function MemberFields({ draft, onChange }: MemberFieldsProps) {
  return (
    <>
      <Field htmlFor="member-name" label="Nom">
        <TextField
          id="member-name"
          value={draft.name}
          onChange={(name) => onChange({ name })}
          placeholder="Ada"
        />
      </Field>

      <Field htmlFor="member-job" label="Métier">
        <TextField
          id="member-job"
          value={draft.job}
          onChange={(job) => onChange({ job })}
          placeholder="Ingénieure logiciel"
        />
      </Field>

      <IconField
        id="member-icon"
        icon={draft.icon}
        onPick={(icon) => onChange({ icon })}
      />

      <Field
        htmlFor="member-description"
        label="Description"
        hint="Écrivez {{username}} là où votre nom doit apparaître."
      >
        <TextArea
          id="member-description"
          rows={3}
          value={draft.description}
          onChange={(description) => onChange({ description })}
          placeholder="Ce que ce membre apporte au conseil, et comment il s'adresse à {{username}}."
        />
      </Field>

      <Field
        htmlFor="member-traits"
        label="Traits"
        hint="Séparés par des virgules."
      >
        <TextField
          id="member-traits"
          value={draft.traits}
          onChange={(traits) => onChange({ traits })}
          placeholder="curieuse, rigoureuse, directe"
        />
      </Field>

      <Field
        htmlFor="member-tags"
        label="Tags"
        hint="Mots-clés de recherche, séparés par des virgules. Absents du prompt."
      >
        <TextField
          id="member-tags"
          value={draft.tags}
          onChange={(tags) => onChange({ tags })}
          placeholder="algorithmes, code, dette technique"
        />
      </Field>
    </>
  );
}
