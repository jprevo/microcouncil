import { EnvironmentTile } from "./EnvironmentTile";
import { useEnvironmentKeys } from "./useEnvironmentKeys";
import { RadioGrid } from "../ui/RadioGrid";
import { useTileRegistry } from "../tiles/useTileRegistry";
import { ENVIRONMENTS } from "../../data";
import { useAppState } from "../../state/hooks";

/** Tabulation itinérante : le groupe radio garde toujours un point d'entrée au clavier. */
function focusableTitle(selected: string | null): string | undefined {
  if (selected !== null) return selected;
  return ENVIRONMENTS[0]?.title;
}

export function EnvironmentsGrid({
  labelledBy,
}: {
  readonly labelledBy: string;
}) {
  const { selectedEnvironment } = useAppState();
  const { register, focus } = useTileRegistry();
  const onKeyDown = useEnvironmentKeys(focus);
  const entry = focusableTitle(selectedEnvironment);

  return (
    <RadioGrid labelledBy={labelledBy} onKeyDown={onKeyDown}>
      {ENVIRONMENTS.map((environment) => (
        <EnvironmentTile
          key={environment.title}
          environment={environment}
          tabIndex={environment.title === entry ? 0 : -1}
          buttonRef={register(environment.title)}
        />
      ))}
    </RadioGrid>
  );
}
