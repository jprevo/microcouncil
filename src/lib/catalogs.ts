import { createCatalog } from "./library";
import { ENVIRONMENTS, MEMBERS } from "../data";

/** The app's two catalogs: what ships, with local edits layered on top. */
export const memberCatalog = createCatalog(
  MEMBERS,
  (member) => member.name,
  (member, name) => ({ ...member, name }),
);

export const environmentCatalog = createCatalog(
  ENVIRONMENTS,
  (environment) => environment.title,
  (environment, title) => ({ ...environment, title }),
);
