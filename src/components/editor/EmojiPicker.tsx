import { useEffect, useMemo, useState } from "react";
import { EmptyMessage } from "../ui/EmptyMessage";
import { TextField } from "../ui/TextField";
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

/** Shortcode search over the emoji cheat sheet table, loaded lazily on first open. */
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
          role="group"
          aria-label={t.emojiPicker.gridLabel}
        >
          {matches.map((entry) => (
            <button
              key={entry.code}
              className="emoji__option"
              type="button"
              title={`:${entry.code}:`}
              aria-label={entry.code}
              aria-pressed={entry.char === icon}
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
