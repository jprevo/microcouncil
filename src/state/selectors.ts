import { useMemo } from 'react';
import { MEMBERS, findEnvironment } from '../data';
import { useAppState } from './hooks';
import type { Environment, Member } from '../types';

export function useSelectedMembers(): readonly Member[] {
  const { selectedMembers } = useAppState();
  return useMemo(() => MEMBERS.filter((member) => selectedMembers.includes(member.name)), [selectedMembers]);
}

export function useIsMemberSelected(name: string): boolean {
  return useAppState().selectedMembers.includes(name);
}

export function useSelectedEnvironment(): Environment | null {
  const { selectedEnvironment } = useAppState();
  if (selectedEnvironment === null) return null;
  return findEnvironment(selectedEnvironment) ?? null;
}
