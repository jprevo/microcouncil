import { TileBadge } from "./TileBadge";
import type { CatalogOrigin } from "../../types";

/** Ce qui distingue la fiche du catalogue livré, s'il y a lieu. */
export function OriginBadge({ origin }: { readonly origin: CatalogOrigin }) {
  if (origin.target.kind === "custom") return <TileBadge>ajouté</TileBadge>;
  return origin.edited ? <TileBadge>modifié</TileBadge> : null;
}
