import { useEffect, useMemo, useState } from "react";
import { EmptyMessage } from "../ui/EmptyMessage";
import { TextField } from "../ui/TextField";
import { useRovingGrid } from "../tiles/useRovingGrid";
import { loadEmojiEntries, searchEmojis } from "../../lib/emoji";
import type { EmojiEntry } from "../../lib/emoji";
import { useT } from "../../locale/useT";

/** Past this, the grid scrolls forever without making the search any more useful. */
const MAX_RESULTS = 84;

interface EmojiPickerProps {
  readonly inputId: string;
  readonly icon: string;
  readonly onPick: (icon: string) => void;
}

/** Name search over the Unicode emoji table, loaded lazily on first open. */
export function EmojiPicker({ inputId, icon, onPick }: EmojiPickerProps) {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<readonly EmojiEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const t = useT();

  useEffect(() => {
    let active = true;
    loadEmojiEntries()
      .then((loaded) => {
        if (active) setEntries(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const matches = useMemo(
    () => (entries === null ? [] : searchEmojis(entries, query, MAX_RESULTS)),
    [entries, query],
  );

  /*
   * Eighty-four options behind a form field, each one a tab stop, put the rest of
   * the dialog out of reach of anyone filling it in from the keyboard. One stop,
   * walked with the arrows, and the chosen icon is where the group is entered.
   */
  const picked = matches.find((entry) => entry.char === icon)?.code;
  const roving = useRovingGrid(
    matches.map((entry) => entry.code),
    picked,
  );

  let message: string | null = null;
  if (failed) message = t.emojiPicker.loadFailed;
  else if (entries === null) message = t.emojiPicker.loading;
  else if (matches.length === 0) message = t.emojiPicker.empty;

  return (
    <div className="emoji">
      <div className="emoji__head">
        <span className="emoji__preview" aria-hidden="true">
          {icon}
        </span>
        <TextField
          id={inputId}
          type="search"
          value={query}
          onChange={setQuery}
          placeholder={t.emojiPicker.searchPlaceholder}
        />
      </div>

      {message !== null ? (
        <EmptyMessage>{message}</EmptyMessage>
      ) : (
        <div
          className="emoji__grid"
          role="toolbar"
          aria-orientation="horizontal"
          aria-label={t.emojiPicker.gridLabel}
          onKeyDown={roving.onKeyDown}
        >
          {matches.map((entry) => (
            <button
              key={entry.code}
              ref={roving.register(entry.code)}
              className="emoji__option"
              type="button"
              title={`:${entry.code}:`}
              tabIndex={roving.tabIndexFor(entry.code)}
              aria-label={entry.code}
              aria-pressed={entry.char === icon}
              onFocus={() => roving.hold(entry.code)}
              onClick={() => onPick(entry.char)}
            >
              <span aria-hidden="true">{entry.char}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
