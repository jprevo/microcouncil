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

/** Filtre le catalogue sur le nom, le métier, la description, les traits et les tags. */
export function filterMembers<T extends Member>(
  members: readonly T[],
  query: string,
): readonly T[] {
  const needle = normalize(query);
  if (needle === "") return members;
  return members.filter((member) => haystack(member).includes(needle));
}
