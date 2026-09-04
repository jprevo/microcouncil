import { EnvironmentFields } from "./EnvironmentFields";
import { useEnvironmentDraft } from "./useEnvironmentDraft";
import { EntryEditor } from "../editor/EntryEditor";
import { useT } from "../../locale/useT";
import { useAppDispatch } from "../../state/hooks";
import type { CatalogEnvironment } from "../../types";

interface EnvironmentEditorProps {
  /** The entry to edit, or null to create a new one. */
  readonly environment: CatalogEnvironment | null;
  readonly titleId: string;
  readonly onClose: () => void;
}

export function EnvironmentEditor({
  environment,
  titleId,
  onClose,
}: EnvironmentEditorProps) {
  const dispatch = useAppDispatch();
  const form = useEnvironmentDraft(environment, onClose);
  const t = useT();

  return (
    <EntryEditor
      entry={environment}
      titleId={titleId}
      createTitle={t.environments.editorCreateTitle}
      error={form.error}
      onDelete={(target) => dispatch({ type: "deleteEnvironment", target })}
      onRestore={(target) => dispatch({ type: "restoreEnvironment", target })}
      onSave={form.save}
      onClose={onClose}
    >
      <EnvironmentFields draft={form.draft} onChange={form.update} />
    </EntryEditor>
  );
}
