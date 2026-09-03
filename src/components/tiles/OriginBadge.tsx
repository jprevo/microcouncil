import { TileBadge } from "./TileBadge";
import type { CatalogOrigin } from "../../types";

/** What sets this entry apart from the shipped catalog, when anything does. */
export function OriginBadge({ origin }: { readonly origin: CatalogOrigin }) {
  if (origin.target.kind === "custom") return <TileBadge>ajouté</TileBadge>;
  return origin.edited ? <TileBadge>modifié</TileBadge> : null;
}
