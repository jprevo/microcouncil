import { normalize } from "./text";
import type { UiStrings } from "../locale/types";
import type { Dynamic } from "../types";

/** The form's own shape: every field is free text. */
export interface DynamicDraft {
  readonly title: string;
  readonly icon: string;
  readonly summary: string;
  readonly description: string;
}

/** Neutral pictogram, so a brand-new dynamic already has a valid icon. */
const DEFAULT_ICON = "🌍";

export const EMPTY_DRAFT: DynamicDraft = {
  title: "",
  icon: DEFAULT_ICON,
  summary: "",
  description: "",
};

export function draftOf(dynamic: Dynamic): DynamicDraft {
  return {
    title: dynamic.title,
    icon: dynamic.icon,
    summary: dynamic.summary,
    description: dynamic.description,
  };
}

export function dynamicOf(draft: DynamicDraft): Dynamic {
  return {
    title: draft.title.trim(),
    icon: draft.icon.trim(),
    summary: draft.summary.trim(),
    description: draft.description.trim(),
  };
}

/** The first problem with the draft, ready to display, or null when it can be saved. */
export function validateDraft(
  draft: DynamicDraft,
  taken: ReadonlySet<string>,
  strings: UiStrings["dynamics"]["validation"],
): string | null {
  const dynamic = dynamicOf(draft);
  if (dynamic.title === "") return strings.titleRequired;
  if (taken.has(normalize(dynamic.title))) return strings.titleTaken;
  if (dynamic.icon === "") return strings.iconRequired;
  if (dynamic.summary === "") return strings.summaryRequired;
  if (dynamic.description === "") return strings.descriptionRequired;
  return null;
}
