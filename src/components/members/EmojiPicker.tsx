import { useMemo, useState } from 'react';
import { EmptyMessage } from '../ui/EmptyMessage';
import { TextField } from '../ui/TextField';
import { searchEmojis } from '../../lib/emoji';

/** Au-delà, la rangée défile sans fin sans rien apporter à la recherche. */
const MAX_RESULTS = 84;

interface EmojiPickerProps {
  readonly inputId: string;
  readonly icon: string;
  readonly onPick: (icon: string) => void;
}

/** Recherche par shortcode dans la table de l'emoji cheat sheet. */
export function EmojiPicker({ inputId, icon, onPick }: EmojiPickerProps) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => searchEmojis(query, MAX_RESULTS), [query]);

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
          placeholder="Chercher : brain, rocket, chart…"
        />
      </div>

      {matches.length === 0 ? (
        <EmptyMessage>Aucune icône pour cette recherche.</EmptyMessage>
      ) : (
        <div className="emoji__grid" role="group" aria-label="Icônes proposées">
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
