import { DynamicFields } from "./DynamicFields";
import { useDynamicDraft } from "./useDynamicDraft";
import { EntryEditor } from "../editor/EntryEditor";
import { useT } from "../../locale/useT";
import { useAppDispatch } from "../../state/hooks";
import type { CatalogDynamic } from "../../types";

interface DynamicEditorProps {
  /** The entry to edit, or null to create a new one. */
  readonly dynamic: CatalogDynamic | null;
  readonly titleId: string;
  readonly onClose: () => void;
}

export function DynamicEditor({
  dynamic,
  titleId,
  onClose,
}: DynamicEditorProps) {
  const dispatch = useAppDispatch();
  const form = useDynamicDraft(dynamic, onClose);
  const t = useT();

  return (
    <EntryEditor
      entry={dynamic}
      titleId={titleId}
      createTitle={t.dynamics.editorCreateTitle}
      error={form.error}
      onDelete={(target) => dispatch({ type: "deleteDynamic", target })}
      onRestore={(target) => dispatch({ type: "restoreDynamic", target })}
      onSave={form.save}
      onClose={onClose}
    >
      <DynamicFields draft={form.draft} onChange={form.update} />
    </EntryEditor>
  );
}
