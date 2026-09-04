import { TileBadge } from "./TileBadge";
import { useT } from "../../locale/useT";
import type { CatalogOrigin } from "../../types";

/** What sets this entry apart from the shipped catalog, when anything does. */
export function OriginBadge({ origin }: { readonly origin: CatalogOrigin }) {
  const t = useT();
  if (origin.target.kind === "custom")
    return <TileBadge>{t.tiles.added}</TileBadge>;
  return origin.edited ? <TileBadge>{t.tiles.modified}</TileBadge> : null;
}
