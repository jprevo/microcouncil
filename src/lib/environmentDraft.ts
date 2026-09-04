import { normalize } from "./text";
import type { UiStrings } from "../locale/types";
import type { Environment } from "../types";

/** The form's own shape: every field is free text. */
export interface EnvironmentDraft {
  readonly title: string;
  readonly icon: string;
  readonly summary: string;
  readonly description: string;
}

/** Neutral pictogram, so a brand-new environment already has a valid icon. */
const DEFAULT_ICON = "🌍";

export const EMPTY_DRAFT: EnvironmentDraft = {
  title: "",
  icon: DEFAULT_ICON,
  summary: "",
  description: "",
};

export function draftOf(environment: Environment): EnvironmentDraft {
  return {
    title: environment.title,
    icon: environment.icon,
    summary: environment.summary,
    description: environment.description,
  };
}

export function environmentOf(draft: EnvironmentDraft): Environment {
  return {
    title: draft.title.trim(),
    icon: draft.icon.trim(),
    summary: draft.summary.trim(),
    description: draft.description.trim(),
  };
}

/** The first problem with the draft, ready to display, or null when it can be saved. */
export function validateDraft(
  draft: EnvironmentDraft,
  taken: ReadonlySet<string>,
  strings: UiStrings["environments"]["validation"],
): string | null {
  const environment = environmentOf(draft);
  if (environment.title === "") return strings.titleRequired;
  if (taken.has(normalize(environment.title))) return strings.titleTaken;
  if (environment.icon === "") return strings.iconRequired;
  if (environment.summary === "") return strings.summaryRequired;
  if (environment.description === "") return strings.descriptionRequired;
  return null;
}
