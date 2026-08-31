import { MEMBERS } from '../data';
import { normalize } from './text';
import type { CatalogMember, Member, MemberLibrary, MemberTarget } from '../types';

export const EMPTY_LIBRARY: MemberLibrary = { custom: [], overrides: {} };

/** Stable identifier of a slot: unique across renames and across both namespaces. */
export function targetKey(target: MemberTarget): string {
  return `${target.kind}:${target.name}`;
}

export function sameTarget(a: MemberTarget, b: MemberTarget): boolean {
  return a.kind === b.kind && a.name === b.name;
}

/** Shipped members first — edits applied in place — then the ones the user created. */
export function buildCatalog(library: MemberLibrary): readonly CatalogMember[] {
  const builtins = MEMBERS.map((member): CatalogMember => {
    const override = library.overrides[member.name];
    return {
      ...(override ?? member),
      target: { kind: 'builtin', name: member.name },
      edited: override !== undefined,
    };
  });
  const custom = library.custom.map(
    (member): CatalogMember => ({ ...member, target: { kind: 'custom', name: member.name }, edited: false }),
  );
  return [...builtins, ...custom];
}

/** The member currently filling a slot, or undefined once that slot is gone. */
export function memberAt(library: MemberLibrary, target: MemberTarget): Member | undefined {
  return buildCatalog(library).find((entry) => sameTarget(entry.target, target));
}

/**
 * Names a new or renamed member may not take. Built-ins keep a claim on their original
 * name even after a rename, so restoring one can never collide with a member created
 * in the meantime.
 */
export function takenNames(library: MemberLibrary, target: MemberTarget | null): ReadonlySet<string> {
  const taken = new Set<string>();
  for (const entry of buildCatalog(library)) {
    if (target !== null && sameTarget(entry.target, target)) continue;
    taken.add(normalize(entry.name));
    if (entry.target.kind === 'builtin') taken.add(normalize(entry.target.name));
  }
  return taken;
}

/** Writes a member into its slot; a null target creates a new custom member. */
export function saveMember(
  library: MemberLibrary,
  target: MemberTarget | null,
  member: Member,
): MemberLibrary {
  if (target === null) {
    return { ...library, custom: [...library.custom, member] };
  }
  if (target.kind === 'builtin') {
    return { ...library, overrides: { ...library.overrides, [target.name]: member } };
  }
  return {
    ...library,
    custom: library.custom.map((entry) => (entry.name === target.name ? member : entry)),
  };
}

/** Removes a member the user created. Built-ins are restored, never deleted. */
export function deleteMember(library: MemberLibrary, target: MemberTarget): MemberLibrary {
  if (target.kind !== 'custom') return library;
  return { ...library, custom: library.custom.filter((entry) => entry.name !== target.name) };
}

/** Drops the local edit of a built-in, bringing the shipped version back. */
export function restoreMember(library: MemberLibrary, target: MemberTarget): MemberLibrary {
  if (target.kind !== 'builtin' || !(target.name in library.overrides)) return library;
  const overrides = { ...library.overrides };
  delete overrides[target.name];
  return { ...library, overrides };
}
