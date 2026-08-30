import type { Ref } from 'react';
import { Tile } from '../tiles/Tile';
import { TileDescription } from '../tiles/TileDescription';
import { TileName } from '../tiles/TileName';
import { humanizeUsernameToken } from '../../lib/text';
import { useAppDispatch, useAppState } from '../../state/hooks';
import type { Environment } from '../../types';

interface EnvironmentTileProps {
  readonly environment: Environment;
  readonly tabIndex: number;
  readonly buttonRef: Ref<HTMLButtonElement>;
}

/** Fiche d'un environnement : bouton radio (sélection unique). */
export function EnvironmentTile({ environment, tabIndex, buttonRef }: EnvironmentTileProps) {
  const selected = useAppState().selectedEnvironment === environment.title;
  const dispatch = useAppDispatch();

  return (
    <Tile
      radio
      icon={environment.icon}
      selected={selected}
      tabIndex={tabIndex}
      buttonRef={buttonRef}
      onClick={() => dispatch({ type: 'toggleEnvironment', title: environment.title })}
    >
      <TileName>{environment.title}</TileName>
      <TileDescription>{humanizeUsernameToken(environment.summary)}</TileDescription>
    </Tile>
  );
}
