import { useCallback, useRef } from "react";

type RefCallback = (node: HTMLButtonElement | null) => void;

interface TileRegistry {
  /** A ref callback that stays stable per key, so the ref is not detached on every render. */
  readonly register: (key: string) => RefCallback;
  readonly focus: (key: string) => void;
}

/** Keeps a handle on the mounted tiles, so the keyboard can move focus between them. */
export function useTileRegistry(): TileRegistry {
  const tiles = useRef(new Map<string, HTMLButtonElement>());
  const callbacks = useRef(new Map<string, RefCallback>());

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

  const focus = useCallback((key: string): void => {
    tiles.current.get(key)?.focus();
  }, []);

  return { register, focus };
}
