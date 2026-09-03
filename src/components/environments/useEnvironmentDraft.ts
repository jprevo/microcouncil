import { useDraftForm } from "../editor/useDraftForm";
import type { DraftForm } from "../editor/useDraftForm";
import { environmentCatalog } from "../../lib/catalogs";
import {
  EMPTY_DRAFT,
  draftOf,
  environmentOf,
  validateDraft,
} from "../../lib/environmentDraft";
import type { EnvironmentDraft } from "../../lib/environmentDraft";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useToast } from "../../toast/useToast";
import type { CatalogEnvironment } from "../../types";

/** A setting being drafted: typed, validated, then written into the catalog. */
export function useEnvironmentDraft(
  environment: CatalogEnvironment | null,
  onSaved: () => void,
): DraftForm<EnvironmentDraft> {
  const { environmentLibrary } = useAppState();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const target = environment?.target ?? null;

  return useDraftForm<EnvironmentDraft>({
    initial: environment === null ? EMPTY_DRAFT : draftOf(environment),
    validate: (draft) =>
      validateDraft(
        draft,
        environmentCatalog.takenNames(environmentLibrary, target),
      ),
    commit: (draft) => {
      const saved = environmentOf(draft);
      dispatch({ type: "saveEnvironment", target, environment: saved });
      toast(
        environment === null
          ? `${saved.title} rejoint les décors`
          : `${saved.title} est à jour`,
      );
      onSaved();
    },
  });
}
