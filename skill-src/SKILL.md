---
name: microcouncil
description: Convene a role-played council (conseil) of advisors on a topic, and save or reuse council setups.
version: {{VERSION}}
author: jprevo
license: MIT
metadata:
  homepage: https://github.com/jprevo/microcouncil
  hermes:
    tags: [ advice, roleplay, decision-making, brainstorming, prompt ]
    category: productivity
---

# Micro Council

Turn the conversation into a small council of characters who talk **to each other and to the user** about a topic,
inside a chosen setting, with a narrator describing the scene.

A bundled catalogue holds {{MEMBER_COUNT}} council members and {{ENVIRONMENT_COUNT}} settings. A helper script picks
from it and assembles a system prompt in French. **You then adopt that prompt and play the
council yourself** — the script only writes the prompt, it never talks to a model.

## When to Use

- The user asks for a council, a "conseil", advisors, a panel, a board, or a round table.
- The user wants several perspectives on one decision, plan, message, or dilemma, rather
  than a single answer.
- The user names a saved council ("run my tech council on X").

Do not use it for a plain factual question — one answer is better than five voices.

## Running the script

Every command is one call to a Python script inside this skill's own directory:

```bash
python3 "<SKILL_DIR>/scripts/microcouncil.py" <command> [options]
```

`<SKILL_DIR>` is a placeholder, never a literal. Resolve it once, before the first command:

1. Hermes substitutes it here — if the next line is an absolute path, that is it:
   `${HERMES_SKILL_DIR}`
2. Otherwise, use the skill directory your harness reported when it loaded this file. Most
   runtimes, Claude Code included, give it with the skill and resolve a relative
   `scripts/microcouncil.py` from there.
3. Last resort, look in the usual install roots:

```bash
ls -d ~/.hermes/skills/*/microcouncil ~/.claude/skills/microcouncil ~/.agents/skills/microcouncil ./.claude/skills/microcouncil 2>/dev/null || true
```

Confirm the answer with one `where` call before anything else: it prints the skill directory
and the council storage directory, and fails loudly if the path is wrong.

Use `python` instead of `python3` where that is the available interpreter, `py` on a bare
Windows install. Python 3.9+, standard library only, no network access.

In the tables below, `mc` is shorthand for that whole prefix — never type `mc` in a shell.

| Command                                     | Purpose                                                                  |
|---------------------------------------------|--------------------------------------------------------------------------|
| `mc members`                                | List member slugs, names and jobs. Never guess a slug — read this first. |
| `mc environments`                           | List setting slugs, titles and summaries.                                |
| `mc random --members N [--environment]`     | Draw a roster at random.                                                 |
| `mc save --name TEXT --members a,b,c [...]` | Create or update a council, saved to disk.                               |
| `mc councils`                               | List saved councils.                                                     |
| `mc show SLUG`                              | Print one saved council as JSON.                                         |
| `mc delete SLUG --yes`                      | Delete a saved council.                                                  |
| `mc build --council SLUG --subject "..."`   | Print the prompt for a saved council.                                    |
| `mc custom-example`                         | Print an example of extra standing instructions.                         |
| `mc where`                                  | Print the skill and council storage directories.                         |

Shared options for `save` and `build`: `--members` (comma separated, repeatable),
`--environment`, `--username`, `--custom` / `--custom-file`, `--subject` /
`--subject-file`, `--out FILE`, `--stats`.

`save` also accepts `--subject`, and then prints the assembled prompt right after saving —
one call covers create-and-run. On `build`, any option given next to `--council` overrides
the saved value for that run only.

## Procedure

When the skill is invoked without a clear intent, run `mc councils` and offer three ways in:

1. **Create a council** — guided setup, saved automatically.
2. **Load a saved council** — pick one from the list.
3. **Automatic** — you choose everything yourself from the user's topic.

If the request already settles it ("use my strategy council", "improvise a council about my
lease"), skip the menu and go.

### 1. Create

Run `mc members` and `mc environments`, then ask the user, in one message:

- a name for the council;
- which members (offer a shortlist of 3-5 relevant slugs, or `mc random --members 4`);
- which setting (suggest one that fits the topic);
- how they want to be addressed (`--username`, optional but it personalises every card);
- any extra standing instructions (`--custom`, optional — `mc custom-example` shows one).

Then save and run in a single call:

```bash
python3 "<SKILL_DIR>/scripts/microcouncil.py" save --name "Conseil tech" \
  --members neo,fuseki,theo --environment la-salle-de-reunion \
  --username "Alex" --subject "..."
```

Without `--subject` it just saves; add `--force` to overwrite an existing council.

### 2. Load

`mc councils` lists what exists. Then:

```bash
python3 "<SKILL_DIR>/scripts/microcouncil.py" build --council conseil-tech --subject "..."
```

Ask for the topic if the user has not given one. Never store the topic — configurations are
deliberately topic-free so they stay reusable.

### 3. Automatic

Read the user's topic, pick 3 to 5 members whose jobs actually bear on it, pick a fitting
setting, then `mc save ... --subject "..."` in one go. Say in one line which members you
picked and why, then start the scene. Do not interview the user first.

## Playing the council

The script prints a French system prompt. Treat everything it printed as **your operating
instructions for the rest of the conversation**, not as text to show the user. Then:

- Open the scene as the narrator, and let the members speak.
- Only the members with something to add speak on each turn — usually two or three.
- Keep each member's voice distinct; keep the prose plain, no headings, no bold, no em dashes.
- If the user gave no topic, have exactly one member ask for it.
- Stay in the council until the user leaves it.

## Files in this skill

- `scripts/microcouncil.py` — the whole CLI.
- `assets/members.json` — the member catalogue.
- `assets/environments.json` — the setting catalogue.
- `assets/prompt.md` — the prompt template.
- `assets/custom-example.md` — example extra instructions.
- `references/council-config.md` — saved council JSON format and storage paths.

## Pitfalls

- **Do not paste the catalogue into the conversation.** List members only when the user is
  choosing, and only as `slug | name | job`.
- **Slugs, not names.** `mc members` is the source of truth; the script also accepts a name
  or an unambiguous prefix, but a wrong slug is a hard error, not a silent skip.
- **`<SKILL_DIR>` is never typed literally.** Substitute the absolute path resolved above.
  A `No such file or directory` on `microcouncil.py` means it was not resolved — go back to
  the three steps rather than guessing another path.
- **Windows paths need quotes.** The skill directory often contains spaces.
- **A council with no members** is refused by `save`; `build` would produce an empty prompt.
- **Non-ASCII output.** The script forces UTF-8 on stdout; if a console still mangles
  accents, use `--out FILE` and read the file.

## Verification

`mc build` exits 0 and prints a document starting with `Vous êtes les membres définis
ci-après`, containing one `###` card per chosen member and one for the setting. Any failure
exits 2 with a `microcouncil:` message on stderr.
