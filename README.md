# Micro Council

[<img src="https://raw.githubusercontent.com/jprevo/microcouncil/refs/heads/main/assets/screenshot.png" alt="Screenshot of microcouncil.me">](https://microcouncil.me)

Build a prompt for a council of experts who discuss a topic together in your
AI assistant. Choose the members, a setting, and optional instructions, then copy
the prompt into ChatGPT, Claude, Gemini, or another assistant.

**[Try Micro Council](https://microcouncil.me)**

Customize members and settings, save councils, and export or import your data.
The web app runs entirely in your browser, stores data locally, and needs no
account or API key. It generates prompts; your chosen assistant runs the council.

## Run locally

Use Node.js 24 and npm.

```bash
npm i
npm run dev
```

## Agent skill

The [bundled skill](skill/SKILL.md) lets an agent create, save, and run councils. It requires Python 3.9+ with no extra
dependencies.
Copy `skill/` into your agent's skills directory.

Example Hermes installation:

```bash
hermes skills install jprevo/microcouncil/skill --force
```

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first to
discuss the scope. Keep documentation, code comments, and pull requests in English.

```bash
npm run gate   # Formatting, lint, TypeScript, unused-code checks, and tests
npm run build  # Production build and HTML prerendering
```

- Edit application code in `src/`, translations in `src/locales/`, and shared
  catalogue IDs in `src/catalog/`.
- Edit the skill in `skill-src/`, then run `npm run skill` and commit the generated
  `skill/` too. Regenerate it after changing the English catalogue or prompt.
- Generated HTML entries and social images are rebuilt automatically by `dev`
  and `build` and are not committed.

## License

[MIT](LICENSE), including the original council content and agent skill.
Keep the copyright and license notice when redistributing.

Bundled fonts retain their SIL Open Font License:
[Archivo](licenses/Archivo-OFL.txt) and
[JetBrains Mono](licenses/JetBrainsMono-OFL.txt).
The emoji catalogue is derived from Unicode's `emoji-test.txt` and is covered by
the [Unicode license](https://www.unicode.org/license.txt).
