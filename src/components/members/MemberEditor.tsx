import { MemberFields } from "./MemberFields";
import { useMemberDraft } from "./useMemberDraft";
import { EntryEditor } from "../editor/EntryEditor";
import { useAppDispatch } from "../../state/hooks";
import type { CatalogMember } from "../../types";

interface MemberEditorProps {
  /** La fiche à modifier, ou null pour en créer une. */
  readonly member: CatalogMember | null;
  readonly titleId: string;
  readonly onClose: () => void;
}

export function MemberEditor({ member, titleId, onClose }: MemberEditorProps) {
  const dispatch = useAppDispatch();
  const form = useMemberDraft(member, onClose);

  return (
    <EntryEditor
      entry={member}
      titleId={titleId}
      createTitle="✨ Nouveau membre"
      error={form.error}
      onDelete={(target) => dispatch({ type: "deleteMember", target })}
      onRestore={(target) => dispatch({ type: "restoreMember", target })}
      onSave={form.save}
      onClose={onClose}
    >
      <MemberFields draft={form.draft} onChange={form.update} />
    </EntryEditor>
  );
}
