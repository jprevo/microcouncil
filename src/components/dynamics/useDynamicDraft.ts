import { useDraftForm } from "../editor/useDraftForm";
import type { DraftForm } from "../editor/useDraftForm";
import {
  EMPTY_DRAFT,
  draftOf,
  dynamicOf,
  validateDraft,
} from "../../lib/dynamicDraft";
import type { DynamicDraft } from "../../lib/dynamicDraft";
import { format } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CatalogDynamic } from "../../types";

/** A group dynamic being drafted: typed, validated, then written into the catalog. */
export function useDynamicDraft(
  dynamic: CatalogDynamic | null,
  onSaved: () => void,
): DraftForm<DynamicDraft> {
  const { dynamicLibrary } = useAppState();
  const { dynamicCatalog } = useLocale();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const t = useT();
  const target = dynamic?.target ?? null;

  return useDraftForm<DynamicDraft>({
    initial: dynamic === null ? EMPTY_DRAFT : draftOf(dynamic),
    validate: (draft) =>
      validateDraft(
        draft,
        dynamicCatalog.takenNames(dynamicLibrary, target),
        t.dynamics.validation,
      ),
    commit: (draft) => {
      const saved = dynamicOf(draft);
      dispatch({ type: "saveDynamic", target, dynamic: saved });
      toast(
        format(
          dynamic === null ? t.dynamics.toastCreated : t.dynamics.toastUpdated,
          { title: saved.title },
        ),
      );
      onSaved();
    },
  });
}
