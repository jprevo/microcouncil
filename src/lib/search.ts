import { normalize } from './text';
import type { Member } from '../types';

function haystack(member: Member): string {
  return normalize([member.name, member.job, member.description, ...member.traits].join(' '));
}

/** Filtre le catalogue sur le nom, le métier, la description et les traits. */
export function filterMembers(members: readonly Member[], query: string): readonly Member[] {
  const needle = normalize(query);
  if (needle === '') return members;
  return members.filter((member) => haystack(member).includes(needle));
}
