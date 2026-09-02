import type { Ref } from "react";
import { OriginBadge } from "../tiles/OriginBadge";
import { Tile } from "../tiles/Tile";
import { TileDescription } from "../tiles/TileDescription";
import { TileEditButton } from "../tiles/TileEditButton";
import { TileName } from "../tiles/TileName";
import { TileSlot } from "../tiles/TileSlot";
import { humanizeUsernameToken } from "../../lib/text";
import { useAppDispatch, useAppState } from "../../state/hooks";
import type { CatalogEnvironment } from "../../types";

interface EnvironmentTileProps {
  readonly environment: CatalogEnvironment;
  readonly tabIndex: number;
  readonly buttonRef: Ref<HTMLButtonElement>;
  readonly onEdit: (environment: CatalogEnvironment) => void;
}

/** Fiche d'un environnement : bouton radio (sélection unique) et crayon d'édition. */
export function EnvironmentTile({
  environment,
  tabIndex,
  buttonRef,
  onEdit,
}: EnvironmentTileProps) {
  const selected = useAppState().selectedEnvironment === environment.title;
  const dispatch = useAppDispatch();

  return (
    <TileSlot
      action={
        <TileEditButton
          label={`Modifier ${environment.title}`}
          onClick={() => onEdit(environment)}
        />
      }
    >
      <Tile
        radio
        icon={environment.icon}
        selected={selected}
        tabIndex={tabIndex}
        buttonRef={buttonRef}
        onClick={() =>
          dispatch({ type: "toggleEnvironment", title: environment.title })
        }
      >
        <TileName>{environment.title}</TileName>
        <OriginBadge origin={environment} />
        <TileDescription>
          {humanizeUsernameToken(environment.summary)}
        </TileDescription>
      </Tile>
    </TileSlot>
  );
}
