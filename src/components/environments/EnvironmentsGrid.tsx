import { EnvironmentTile } from "./EnvironmentTile";
import { RadioGrid } from "../ui/RadioGrid";
import { useRovingGrid } from "../tiles/useRovingGrid";
import { targetKey } from "../../lib/library";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useEnvironmentCatalog } from "../../state/selectors";
import type { CatalogEnvironment } from "../../types";

interface EnvironmentsGridProps {
  readonly labelledBy: string;
  readonly onEdit: (environment: CatalogEnvironment) => void;
}

export function EnvironmentsGrid({
  labelledBy,
  onEdit,
}: EnvironmentsGridProps) {
  const { selectedEnvironment } = useAppState();
  const dispatch = useAppDispatch();
  const catalog = useEnvironmentCatalog();
  const titles = catalog.map((environment) => environment.title);

  /*
   * Moving inside a radio group is choosing: that is the one behaviour that sets
   * this grid apart from the member toolbar next to it, where the arrows have to
   * leave every toggle exactly as they found it.
   */
  const roving = useRovingGrid(
    titles,
    selectedEnvironment ?? undefined,
    (title) => dispatch({ type: "environment", title }),
  );

  return (
    <RadioGrid labelledBy={labelledBy} onKeyDown={roving.onKeyDown}>
      {catalog.map((environment) => (
        <EnvironmentTile
          key={targetKey(environment.target)}
          environment={environment}
          tabIndex={roving.tabIndexFor(environment.title)}
          buttonRef={roving.register(environment.title)}
          onFocus={() => roving.hold(environment.title)}
          onEdit={onEdit}
        />
      ))}
    </RadioGrid>
  );
}
