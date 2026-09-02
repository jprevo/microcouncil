import { useMemo } from "react";
import { environmentCatalog, memberCatalog } from "../lib/catalogs";
import { useAppState } from "./hooks";
import type { CatalogEnvironment, CatalogMember } from "../types";

/** Le catalogue effectif des membres, tel que l'utilisateur l'a laissé. */
export function useMemberCatalog(): readonly CatalogMember[] {
  const { memberLibrary } = useAppState();
  return useMemo(() => memberCatalog.build(memberLibrary), [memberLibrary]);
}

/** Le catalogue effectif des environnements, tel que l'utilisateur l'a laissé. */
export function useEnvironmentCatalog(): readonly CatalogEnvironment[] {
  const { environmentLibrary } = useAppState();
  return useMemo(
    () => environmentCatalog.build(environmentLibrary),
    [environmentLibrary],
  );
}

/** Les fiches sélectionnées, avec leur origine : une sauvegarde en a besoin. */
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
