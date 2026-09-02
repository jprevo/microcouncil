import { IconField } from "../editor/IconField";
import { Field } from "../ui/Field";
import { TextArea } from "../ui/TextArea";
import { TextField } from "../ui/TextField";
import type { EnvironmentDraft } from "../../lib/environmentDraft";

interface EnvironmentFieldsProps {
  readonly draft: EnvironmentDraft;
  readonly onChange: (patch: Partial<EnvironmentDraft>) => void;
}

/** Les champs d'un environnement, sans aucune logique d'enregistrement. */
export function EnvironmentFields({ draft, onChange }: EnvironmentFieldsProps) {
  return (
    <>
      <Field htmlFor="environment-title" label="Titre">
        <TextField
          id="environment-title"
          value={draft.title}
          onChange={(title) => onChange({ title })}
          placeholder="Le refuge de montagne"
        />
      </Field>

      <IconField
        id="environment-icon"
        icon={draft.icon}
        onPick={(icon) => onChange({ icon })}
      />

      <Field
        htmlFor="environment-summary"
        label="Résumé"
        hint="Une phrase, affichée sur la fiche. Absente du prompt."
      >
        <TextArea
          id="environment-summary"
          rows={1}
          value={draft.summary}
          onChange={(summary) => onChange({ summary })}
          placeholder="Ce que ce décor change à la discussion, en une phrase."
        />
      </Field>

      <Field
        htmlFor="environment-description"
        label="Description"
        hint="Le décor tel qu'il est posé dans le prompt. Écrivez {{username}} là où votre nom doit apparaître."
      >
        <TextArea
          id="environment-description"
          rows={4}
          value={draft.description}
          onChange={(description) => onChange({ description })}
          placeholder="Vous êtes réunis autour du poêle d'un refuge, la nuit tombe sur la vallée."
        />
      </Field>
    </>
  );
}
