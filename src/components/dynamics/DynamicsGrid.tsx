import { DynamicTile } from "./DynamicTile";
import { RadioGrid } from "../ui/RadioGrid";
import { useRovingGrid } from "../tiles/useRovingGrid";
import { targetKey } from "../../lib/library";
import { useAppDispatch, useAppState } from "../../state/hooks";
import { useDynamicCatalog } from "../../state/selectors";
import type { CatalogDynamic } from "../../types";

interface DynamicsGridProps {
  readonly labelledBy: string;
  readonly onEdit: (dynamic: CatalogDynamic) => void;
}

export function DynamicsGrid({ labelledBy, onEdit }: DynamicsGridProps) {
  const { selectedDynamic } = useAppState();
  const dispatch = useAppDispatch();
  const catalog = useDynamicCatalog();
  const titles = catalog.map((dynamic) => dynamic.title);

  /*
   * Moving inside a radio group is choosing: that is the one behaviour that sets
   * this grid apart from the member toolbar next to it, where the arrows have to
   * leave every toggle exactly as they found it.
   */
  const roving = useRovingGrid(titles, selectedDynamic ?? undefined, (title) =>
    dispatch({ type: "dynamic", title }),
  );

  return (
    <RadioGrid labelledBy={labelledBy} onKeyDown={roving.onKeyDown}>
      {catalog.map((dynamic) => (
        <DynamicTile
          key={targetKey(dynamic.target)}
          dynamic={dynamic}
          tabIndex={roving.tabIndexFor(dynamic.title)}
          buttonRef={roving.register(dynamic.title)}
          onFocus={() => roving.hold(dynamic.title)}
          onEdit={onEdit}
        />
      ))}
    </RadioGrid>
  );
}
