import { useState } from "react";
import { takenNames } from "../../lib/catalog";
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

interface MemberDraftForm {
  readonly draft: MemberDraft;
  /** Message de validation, affiché seulement après une tentative d'enregistrement. */
  readonly error: string | null;
  readonly update: (patch: Partial<MemberDraft>) => void;
  readonly save: () => void;
}

/** Brouillon de fiche : saisie, validation, puis enregistrement dans le catalogue. */
export function useMemberDraft(
  member: CatalogMember | null,
  onSaved: () => void,
): MemberDraftForm {
  const { memberLibrary } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [draft, setDraft] = useState<MemberDraft>(() =>
    member === null ? EMPTY_DRAFT : draftOf(member),
  );
  const [error, setError] = useState<string | null>(null);

  const target = member?.target ?? null;

  const update = (patch: Partial<MemberDraft>): void => {
    setDraft((current) => ({ ...current, ...patch }));
    setError(null);
  };

  const save = (): void => {
    const problem = validateDraft(draft, takenNames(memberLibrary, target));
    if (problem !== null) {
      setError(problem);
      return;
    }
    const saved = memberOf(draft);
    dispatch({ type: "saveMember", target, member: saved });
    toast(
      member === null
        ? `${saved.name} rejoint le conseil`
        : `${saved.name} est à jour`,
    );
    onSaved();
  };

  return { draft, error, update, save };
}
