import { normalize } from "./text";
import type { Member } from "../types";

function haystack(member: Member): string {
  return normalize(
    [
      member.name,
      member.job,
      member.description,
      ...member.traits,
      ...member.tags,
    ].join(" "),
  );
}

/** Filters the catalog on name, job, description, traits and tags. */
export function filterMembers<T extends Member>(
  members: readonly T[],
  query: string,
): readonly T[] {
  const needle = normalize(query);
  if (needle === "") return members;
  return members.filter((member) => haystack(member).includes(needle));
}
