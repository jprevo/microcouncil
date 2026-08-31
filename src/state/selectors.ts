import { useMemo } from 'react';
import { findEnvironment } from '../data';
import { buildCatalog } from '../lib/catalog';
import { useAppState } from './hooks';
import type { CatalogMember, Environment, Member } from '../types';

/** Le catalogue effectif : les fiches livrées, telles que l'utilisateur les a laissées. */
export function useCatalog(): readonly CatalogMember[] {
  const { memberLibrary } = useAppState();
  return useMemo(() => buildCatalog(memberLibrary), [memberLibrary]);
}

export function useSelectedMembers(): readonly Member[] {
  const { selectedMembers } = useAppState();
  const catalog = useCatalog();
  return useMemo(
    () => catalog.filter((member) => selectedMembers.includes(member.name)),
    [catalog, selectedMembers],
  );
}

export function useIsMemberSelected(name: string): boolean {
  return useAppState().selectedMembers.includes(name);
}

export function useSelectedEnvironment(): Environment | null {
  const { selectedEnvironment } = useAppState();
  if (selectedEnvironment === null) return null;
  return findEnvironment(selectedEnvironment) ?? null;
}
