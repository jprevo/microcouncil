import { createCatalog } from "./library";
import { ENVIRONMENTS, MEMBERS } from "../data";

/** Les deux catalogues de l'application, livrés puis recouverts par les éditions locales. */
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
