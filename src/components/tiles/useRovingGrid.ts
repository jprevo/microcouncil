import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type RefCallback = (node: HTMLElement | null) => void;

export interface RovingGrid {
  /** 0 for the one entry point of the group, -1 for everything else in it. */
  readonly tabIndexFor: (key: string) => 0 | -1;
  /** Ref callback for the tile of `key`, so the arrows can move focus onto it. */
  readonly register: (key: string) => RefCallback;
  /** Follows the focus back, for when it arrives by click or by Tab. */
  readonly hold: (key: string) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const HORIZONTAL: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowLeft: -1,
};

/**
 * How many tiles fit on a row, read off the page rather than guessed: the grid is
 * `auto-fill`, so the count changes with the width of the window and there is no
 * number in the stylesheet to import. Everything on the first row shares its top
 * edge, and the first tile that does not is the start of the second row.
 *
 * Measured against the viewport, not with `offsetTop`: each tile sits in its own
 * positioned slot, so its offset top is zero on every row and the count would
 * come back as the whole list — which is to say, one row, and a down arrow that
 * behaved like End.
 *
 * The pixel of slack absorbs sub-pixel rounding between tiles of a row.
 */
function columnsOf(nodes: readonly HTMLElement[]): number {
  const first = nodes[0];
  if (first === undefined) return 1;

  const top = first.getBoundingClientRect().top;
  const columns = nodes.findIndex(
    (node) => node.getBoundingClientRect().top > top + 1,
  );
  return columns === -1 ? nodes.length : columns;
}

/**
 * Arrow-key navigation over a grid of tiles, with a single tab stop.
 *
 * Without it, reaching the prompt from the top of the page took a hundred and
 * thirteen presses of Tab: the member grid alone is forty-odd tiles, each with
 * an edit pencil beside it. Here the whole grid holds one entry point — the
 * selected tile, or the first — and the arrows walk it: left and right by one,
 * up and down by a row, Home and End to either end.
 *
 * The pencil of the active tile shares its tab index, so it stays reachable
 * without a shortcut nobody would guess: Tab lands on the tile, Tab again on its
 * pencil, Tab again leaves the grid.
 *
 * `entry` is where the group is entered when nothing has been focused yet — the
 * current selection, so that tabbing in lands on what the user last chose rather
 * than back at the top of a long list.
 *
 * `onMove` is what a radio group needs and a set of toggles must not have: in a
 * `radiogroup` moving the focus *is* choosing, whereas moving across a grid of
 * independent toggles has to leave every one of them alone.
 */
export function useRovingGrid(
  keys: readonly string[],
  entry: string | undefined,
  onMove?: (key: string) => void,
): RovingGrid {
  const [held, setHeld] = useState<string | null>(null);
  const tiles = useRef(new Map<string, HTMLElement>());
  const callbacks = useRef(new Map<string, RefCallback>());

  // The held tile can have been filtered out or deleted since it was focused.
  const active =
    held !== null && keys.includes(held) ? held : (entry ?? keys[0]);

  const register = useCallback((key: string): RefCallback => {
    const existing = callbacks.current.get(key);
    if (existing !== undefined) return existing;

    const callback: RefCallback = (node) => {
      if (node === null) tiles.current.delete(key);
      else tiles.current.set(key, node);
    };
    callbacks.current.set(key, callback);
    return callback;
  }, []);

  const goTo = useCallback(
    (key: string): void => {
      setHeld(key);
      onMove?.(key);
      tiles.current.get(key)?.focus();
    },
    [onMove],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      /*
       * Where the move starts from is read off the event, not off `active`: a key
       * held down fires faster than React re-renders, and a handler that asked
       * the state where the focus was would answer with where it had been one
       * press ago and walk the grid at half speed.
       *
       * It doubles as the filter that keeps the pencils out of it — a pencil is a
       * tab stop inside the group, not a cell of it, and it is not registered.
       */
      const from = event.target;
      if (!(from instanceof HTMLElement)) return;

      const at = keys.findIndex((key) => tiles.current.get(key) === from);
      if (at === -1) return;

      const next = nextIndex(event.key, at, keys, tiles.current);
      if (next === null) return;

      const target = keys[next];
      if (target === undefined) return;

      // Claimed either way: at the end of a column the arrow moves nothing, and
      // letting it through would scroll the page out from under the grid.
      event.preventDefault();
      if (next !== at) goTo(target);
    },
    [keys, goTo],
  );

  return {
    tabIndexFor: (key) => (key === active ? 0 : -1),
    register,
    hold: setHeld,
    onKeyDown,
  };
}

/**
 * Where a key press lands, or null when the key is none of ours.
 *
 * Left and right wrap, because a row of tiles reads as a loop and the end of one
 * is next to the start of the following. Up and down clamp instead: a column
 * that wrapped would drop the focus somewhere unrelated, several rows away.
 */
function nextIndex(
  key: string,
  at: number,
  keys: readonly string[],
  tiles: ReadonlyMap<string, HTMLElement>,
): number | null {
  if (key === "Home") return 0;
  if (key === "End") return keys.length - 1;

  const step = HORIZONTAL[key];
  if (step !== undefined) return (at + step + keys.length) % keys.length;

  if (key !== "ArrowDown" && key !== "ArrowUp") return null;

  const nodes = keys
    .map((one) => tiles.get(one))
    .filter((node): node is HTMLElement => node !== undefined);
  const columns = columnsOf(nodes);
  const row = key === "ArrowDown" ? at + columns : at - columns;
  return Math.min(Math.max(row, 0), keys.length - 1);
}
