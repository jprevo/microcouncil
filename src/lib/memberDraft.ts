import { normalize } from "./text";
import type { Member } from "../types";

/** The form's own shape: every field is free text, traits and tags included. */
export interface MemberDraft {
  readonly name: string;
  readonly icon: string;
  readonly job: string;
  readonly description: string;
  /** Traits, comma-separated. */
  readonly traits: string;
  /** Search keywords, comma-separated. */
  readonly tags: string;
}

/** Neutral pictogram, so a brand-new member already has a valid icon. */
const DEFAULT_ICON = "🙂";

export const EMPTY_DRAFT: MemberDraft = {
  name: "",
  icon: DEFAULT_ICON,
  job: "",
  description: "",
  traits: "",
  tags: "",
};

export function draftOf(member: Member): MemberDraft {
  return {
    name: member.name,
    icon: member.icon,
    job: member.job,
    description: member.description,
    traits: member.traits.join(", "),
    tags: member.tags.join(", "),
  };
}

/** Turns an "a, b, c" input into clean entries, with no blanks and no duplicates. */
function splitList(value: string): string[] {
  const entries = value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");
  return [...new Set(entries)];
}

export function memberOf(draft: MemberDraft): Member {
  return {
    name: draft.name.trim(),
    icon: draft.icon.trim(),
    job: draft.job.trim(),
    description: draft.description.trim(),
    traits: splitList(draft.traits),
    tags: splitList(draft.tags),
  };
}

/** The first problem with the draft, ready to display, or null when it can be saved. */
export function validateDraft(
  draft: MemberDraft,
  taken: ReadonlySet<string>,
): string | null {
  const member = memberOf(draft);
  if (member.name === "") return "Le nom est obligatoire.";
  if (taken.has(normalize(member.name)))
    return "Ce nom est déjà pris par un autre membre.";
  if (member.icon === "") return "Choisissez une icône.";
  if (member.job === "") return "Le métier est obligatoire.";
  if (member.description === "") return "La description est obligatoire.";
  return null;
}
