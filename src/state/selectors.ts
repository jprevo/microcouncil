import { useMemo } from "react";
import { useAppState } from "./hooks";
import { useLocale } from "../locale/useLocale";
import type { CatalogEnvironment, CatalogMember } from "../types";

/** The member catalog as it actually stands, with the user's edits applied. */
export function useMemberCatalog(): readonly CatalogMember[] {
  const { memberLibrary } = useAppState();
  const { memberCatalog } = useLocale();
  return useMemo(
    () => memberCatalog.build(memberLibrary),
    [memberCatalog, memberLibrary],
  );
}

/** The setting catalog as it actually stands, with the user's edits applied. */
export function useEnvironmentCatalog(): readonly CatalogEnvironment[] {
  const { environmentLibrary } = useAppState();
  const { environmentCatalog } = useLocale();
  return useMemo(
    () => environmentCatalog.build(environmentLibrary),
    [environmentCatalog, environmentLibrary],
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

export function useSelectedEnvironment(): CatalogEnvironment | null {
  const { selectedEnvironment } = useAppState();
  const catalog = useEnvironmentCatalog();
  return useMemo(
    () =>
      catalog.find(
        (environment) => environment.title === selectedEnvironment,
      ) ?? null,
    [catalog, selectedEnvironment],
  );
}
