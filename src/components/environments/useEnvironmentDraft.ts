import { useDraftForm } from "../editor/useDraftForm";
import type { DraftForm } from "../editor/useDraftForm";
import {
  EMPTY_DRAFT,
  draftOf,
  environmentOf,
  validateDraft,
} from "../../lib/environmentDraft";
import type { EnvironmentDraft } from "../../lib/environmentDraft";
import { format } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CatalogEnvironment } from "../../types";

/** A setting being drafted: typed, validated, then written into the catalog. */
export function useEnvironmentDraft(
  environment: CatalogEnvironment | null,
  onSaved: () => void,
): DraftForm<EnvironmentDraft> {
  const { environmentLibrary } = useAppState();
  const { environmentCatalog } = useLocale();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const t = useT();
  const target = environment?.target ?? null;

  return useDraftForm<EnvironmentDraft>({
    initial: environment === null ? EMPTY_DRAFT : draftOf(environment),
    validate: (draft) =>
      validateDraft(
        draft,
        environmentCatalog.takenNames(environmentLibrary, target),
        t.environments.validation,
      ),
    commit: (draft) => {
      const saved = environmentOf(draft);
      dispatch({ type: "saveEnvironment", target, environment: saved });
      toast(
        format(
          environment === null
            ? t.environments.toastCreated
            : t.environments.toastUpdated,
          { title: saved.title },
        ),
      );
      onSaved();
    },
  });
}
