import { createCatalog } from "./library";
import type { Catalog } from "./library";
import type { Environment, Member } from "../types";
import type { LocaleBundle } from "../locale/types";

export interface Catalogs {
  readonly memberCatalog: Catalog<Member>;
  readonly environmentCatalog: Catalog<Environment>;
}

/**
 * The app's two catalogs, built from one locale's bundle: what ships in that
 * language, with the user's local edits layered on top. Each shipped entry keeps
 * the stable `id` its bundle gave it, stripped out of the plain `Member` /
 * `Environment` object the rest of the app works with.
 */
export function createCatalogs(bundle: LocaleBundle): Catalogs {
  const memberCatalog = createCatalog(
    bundle.members.map(({ id, ...item }) => ({ id, item })),
    (member) => member.name,
    (member, name) => ({ ...member, name }),
  );

  const environmentCatalog = createCatalog(
    bundle.environments.map(({ id, ...item }) => ({ id, item })),
    (environment) => environment.title,
    (environment, title) => ({ ...environment, title }),
  );

  return { memberCatalog, environmentCatalog };
}
