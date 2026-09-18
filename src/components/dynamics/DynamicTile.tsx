import type { Ref } from "react";
import { OriginBadge } from "../tiles/OriginBadge";
import { Tile } from "../tiles/Tile";
import { TileDescription } from "../tiles/TileDescription";
import { TileEditButton } from "../tiles/TileEditButton";
import { TileName } from "../tiles/TileName";
import { TileSlot } from "../tiles/TileSlot";
import { humanizeUsernameToken } from "../../lib/text";
import { format } from "../../locale/i18n";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";
import { useAppDispatch, useAppState } from "../../state/hooks";
import type { CatalogDynamic } from "../../types";

interface DynamicTileProps {
  readonly dynamic: CatalogDynamic;
  readonly tabIndex: number;
  readonly buttonRef: Ref<HTMLButtonElement>;
  readonly onFocus: () => void;
  readonly onEdit: (dynamic: CatalogDynamic) => void;
}

/** A group dynamic's tile: a radio button (single selection) and an edit pencil. */
export function DynamicTile({
  dynamic,
  tabIndex,
  buttonRef,
  onFocus,
  onEdit,
}: DynamicTileProps) {
  const selected = useAppState().selectedDynamic === dynamic.title;
  const dispatch = useAppDispatch();
  const { bundle } = useLocale();
  const t = useT();

  return (
    <TileSlot
      action={
        <TileEditButton
          label={format(t.dynamics.edit, { title: dynamic.title })}
          tabIndex={tabIndex}
          onFocus={onFocus}
          onClick={() => onEdit(dynamic)}
        />
      }
    >
      <Tile
        radio
        icon={dynamic.icon}
        selected={selected}
        tabIndex={tabIndex}
        buttonRef={buttonRef}
        onFocus={onFocus}
        onClick={() =>
          dispatch({ type: "toggleDynamic", title: dynamic.title })
        }
      >
        <TileName>{dynamic.title}</TileName>
        <OriginBadge origin={dynamic} />
        <TileDescription>
          {humanizeUsernameToken(dynamic.summary, bundle.meta.youWord)}
        </TileDescription>
      </Tile>
    </TileSlot>
  );
}
