import { useDraftForm } from "../editor/useDraftForm";
import type { DraftForm } from "../editor/useDraftForm";
import {
  EMPTY_DRAFT,
  draftOf,
  memberOf,
  validateDraft,
} from "../../lib/memberDraft";
import type { MemberDraft } from "../../lib/memberDraft";
import { format } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CatalogMember } from "../../types";

/** A member being drafted: typed, validated, then written into the catalog. */
export function useMemberDraft(
  member: CatalogMember | null,
  onSaved: () => void,
): DraftForm<MemberDraft> {
  const { memberLibrary } = useAppState();
  const { memberCatalog } = useLocale();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const t = useT();
  const target = member?.target ?? null;

  return useDraftForm<MemberDraft>({
    initial: member === null ? EMPTY_DRAFT : draftOf(member),
    validate: (draft) =>
      validateDraft(
        draft,
        memberCatalog.takenNames(memberLibrary, target),
        t.members.validation,
      ),
    commit: (draft) => {
      const saved = memberOf(draft);
      dispatch({ type: "saveMember", target, member: saved });
      toast(
        format(
          member === null ? t.members.toastCreated : t.members.toastUpdated,
          {
            name: saved.name,
          },
        ),
      );
      onSaved();
    },
  });
}
