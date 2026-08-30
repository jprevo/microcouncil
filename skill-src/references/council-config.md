# Saved council configurations

A council is a reusable cast: who sits at the table, where, and under what standing
instructions. **The topic is never part of it** — that is what makes a council reusable
across conversations.

## Where they live

One JSON file per council, named after its slug, in a per-user data directory:

| Platform | Directory |
| --- | --- |
| Windows | `%APPDATA%\microcouncil\councils` |
| macOS | `~/Library/Application Support/microcouncil/councils` |
| Linux, other | `${XDG_DATA_HOME:-~/.local/share}/microcouncil/councils` |

Setting `MICROCOUNCIL_HOME` overrides the parent directory, so councils can be kept in a
synced folder or scoped to a project: councils then live in `$MICROCOUNCIL_HOME/councils`.
`microcouncil.py where` prints the resolved path.

## Format

```json
{
  "schemaVersion": 1,
  "slug": "conseil-tech",
  "name": "Conseil tech",
  "username": "Alex",
  "members": ["neo", "fuseki", "theo"],
  "environment": "la-salle-de-reunion",
  "customInstructions": "",
  "createdAt": "2026-08-30T09:12:00Z",
  "updatedAt": "2026-08-30T09:12:00Z"
}
```

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Format version. Currently `1`. |
| `slug` | File name, derived from `name` unless `--slug` was passed. |
| `name` | Human readable label shown by `councils`. |
| `username` | How the council addresses the user. Empty falls back to `l'utilisateur`. |
| `members` | Member slugs, rendered in this order. At least one. |
| `environment` | Setting slug, or `null` for no setting. |
| `customInstructions` | Extra standing instructions, or `""` to drop that section. |
| `createdAt`, `updatedAt` | UTC timestamps, preserved across overwrites. |

## Editing by hand

The files are plain JSON and safe to edit or copy between machines. Slugs must match the
bundled catalogue — check with `microcouncil.py members` and `microcouncil.py environments`.

A slug that disappears from the catalogue after a skill update is **not** fatal: `build`
prints a warning on stderr and carries on without it. A council left with no valid member
still builds, but the prompt says no member was selected — fix the file or re-`save` it.
