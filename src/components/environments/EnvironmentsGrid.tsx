import { EnvironmentTile } from "./EnvironmentTile";
import { useEnvironmentKeys } from "./useEnvironmentKeys";
import { RadioGrid } from "../ui/RadioGrid";
import { useTileRegistry } from "../tiles/useTileRegistry";
import { targetKey } from "../../lib/library";
import { useAppState } from "../../state/hooks";
import { useEnvironmentCatalog } from "../../state/selectors";
import type { CatalogEnvironment } from "../../types";

interface EnvironmentsGridProps {
  readonly labelledBy: string;
  readonly onEdit: (environment: CatalogEnvironment) => void;
}

/** Tabulation itinérante : le groupe radio garde toujours un point d'entrée au clavier. */
function focusableTitle(
  catalog: readonly CatalogEnvironment[],
  selected: string | null,
): string | undefined {
  if (selected !== null) return selected;
  return catalog[0]?.title;
}

export function EnvironmentsGrid({
  labelledBy,
  onEdit,
}: EnvironmentsGridProps) {
  const { selectedEnvironment } = useAppState();
  const catalog = useEnvironmentCatalog();
  const { register, focus } = useTileRegistry();
  const onKeyDown = useEnvironmentKeys(catalog, focus);
  const entry = focusableTitle(catalog, selectedEnvironment);

  return (
    <RadioGrid labelledBy={labelledBy} onKeyDown={onKeyDown}>
      {catalog.map((environment) => (
        <EnvironmentTile
          key={targetKey(environment.target)}
          environment={environment}
          tabIndex={environment.title === entry ? 0 : -1}
          buttonRef={register(environment.title)}
          onEdit={onEdit}
        />
      ))}
    </RadioGrid>
  );
}
