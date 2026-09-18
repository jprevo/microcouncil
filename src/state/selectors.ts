import { useMemo } from "react";
import { useAppState } from "./hooks";
import { useLocale } from "../locale/useLocale";
import type { CatalogDynamic, CatalogMember } from "../types";

/** The member catalog as it actually stands, with the user's edits applied. */
export function useMemberCatalog(): readonly CatalogMember[] {
  const { memberLibrary } = useAppState();
  const { memberCatalog } = useLocale();
  return useMemo(
    () => memberCatalog.build(memberLibrary),
    [memberCatalog, memberLibrary],
  );
}

/** The group-dynamic catalog as it actually stands, with the user's edits applied. */
export function useDynamicCatalog(): readonly CatalogDynamic[] {
  const { dynamicLibrary } = useAppState();
  const { dynamicCatalog } = useLocale();
  return useMemo(
    () => dynamicCatalog.build(dynamicLibrary),
    [dynamicCatalog, dynamicLibrary],
  );
}

/** The selected entries, origin included — saving a council needs it. */
export function useSelectedMembers(): readonly CatalogMember[] {
  const { selectedMembers } = useAppState();
  const catalog = useMemberCatalog();
  return useMemo(
    () => catalog.filter((member) => selectedMembers.includes(member.name)),
    [catalog, selectedMembers],
  );
}

export function useIsMemberSelected(name: string): boolean {
  return useAppState().selectedMembers.includes(name);
}

export function useSelectedDynamic(): CatalogDynamic | null {
  const { selectedDynamic } = useAppState();
  const catalog = useDynamicCatalog();
  return useMemo(
    () => catalog.find((dynamic) => dynamic.title === selectedDynamic) ?? null,
    [catalog, selectedDynamic],
  );
}
