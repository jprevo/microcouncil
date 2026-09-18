import { createCatalog } from "./library";
import type { Catalog } from "./library";
import type { Dynamic, Member } from "../types";
import type { LocaleBundle } from "../locale/types";

export interface Catalogs {
  readonly memberCatalog: Catalog<Member>;
  readonly dynamicCatalog: Catalog<Dynamic>;
}

/**
 * The app's two catalogs, built from one locale's bundle: what ships in that
 * language, with the user's local edits layered on top. Each shipped entry keeps
 * the stable `id` its bundle gave it, stripped out of the plain `Member` /
 * `Dynamic` object the rest of the app works with.
 */
export function createCatalogs(bundle: LocaleBundle): Catalogs {
  const memberCatalog = createCatalog(
    bundle.members.map(({ id, ...item }) => ({ id, item })),
    (member) => member.name,
    (member, name) => ({ ...member, name }),
  );

  const dynamicCatalog = createCatalog(
    bundle.dynamics.map(({ id, ...item }) => ({ id, item })),
    (dynamic) => dynamic.title,
    (dynamic, title) => ({ ...dynamic, title }),
  );

  return { memberCatalog, dynamicCatalog };
}
