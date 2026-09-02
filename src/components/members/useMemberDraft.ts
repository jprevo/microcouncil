import { useDraftForm } from "../editor/useDraftForm";
import type { DraftForm } from "../editor/useDraftForm";
import { memberCatalog } from "../../lib/catalogs";
import {
  EMPTY_DRAFT,
  draftOf,
  memberOf,
  validateDraft,
} from "../../lib/memberDraft";
import type { MemberDraft } from "../../lib/memberDraft";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CatalogMember } from "../../types";

/** Brouillon de membre : saisie, validation, puis enregistrement dans le catalogue. */
export function useMemberDraft(
  member: CatalogMember | null,
  onSaved: () => void,
): DraftForm<MemberDraft> {
  const { memberLibrary } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const target = member?.target ?? null;

  return useDraftForm<MemberDraft>({
    initial: member === null ? EMPTY_DRAFT : draftOf(member),
    validate: (draft) =>
      validateDraft(draft, memberCatalog.takenNames(memberLibrary, target)),
    commit: (draft) => {
      const saved = memberOf(draft);
      dispatch({ type: "saveMember", target, member: saved });
      toast(
        member === null
          ? `${saved.name} rejoint le conseil`
          : `${saved.name} est à jour`,
      );
      onSaved();
    },
  });
}
