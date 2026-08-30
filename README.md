# Micro Council

Générateur de prompt pour convoquer un conseil de compagnons dans Claude, ChatGPT, Gemini
ou n'importe quel autre assistant.

L'interface permet de choisir son nom, les membres du conseil (à la main ou tirés au sort),
un environnement (idem), des instructions additionnelles optionnelles et le sujet de la
demande (optionnel lui aussi). Le prompt est reconstruit en direct à partir du gabarit
`docs/data/prompt.md`, puis copié en un clic.

Nom, sélection, instructions et thème sont mémorisés dans le `localStorage` du navigateur.

## Commandes

```bash
npm install
```

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement Vite. |
| `npm run typecheck` | Vérification TypeScript stricte, sans émission. |
| `npm run build` | Typecheck puis build dans `dist/`. |
| `npm run package` | **Produit `dist/microcouncil.html`** : un fichier unique (HTML + CSS + données + JS inlinés), sans aucune dépendance externe, à partager ou à ouvrir directement depuis le disque. |

```bash
npm run package
```

## Architecture

L'interface est une application **React 19 + TypeScript**, compilée par Vite puis inlinée en un
fichier unique par `vite-plugin-singlefile` (React inclus : aucune requête réseau à l'exécution).

Le découpage privilégie des composants très courts, à responsabilité unique :

- `src/state/` — `reducer.ts` (toutes les transitions), `AppStateProvider.tsx` (état + persistance),
  `selectors.ts` et `usePrompt.ts` (dérivations mémoïsées). L'état et le `dispatch` voyagent dans
  deux contextes distincts, pour que les composants qui n'écrivent que via `dispatch` ne se
  re-rendent pas à chaque frappe ;
- `src/components/ui/` — les primitives sans logique métier (`Button`, `Card`, `TextField`,
  `Stepper`…) ;
- `src/components/tiles/` — la coquille commune aux fiches (`Tile`) et ses fragments ;
- `src/components/<domaine>/` — une carte par section du formulaire (`members`, `environments`,
  `identity`, `custom`, `subject`, `output`), chacune accompagnée de ses propres hooks
  (`useDrawMembers`, `useEnvironmentKeys`, `useCopyPrompt`…) ;
- `src/lib/` et `src/prompt.ts`, `src/random.ts`, `src/storage.ts` — la logique pure, sans React,
  testable et réutilisable telle quelle.

## Sources de données

Tout le contenu éditorial vit hors du code :

- `src/members.json` — le catalogue des compagnons (`name`, `icon`, `job`, `description`, `traits`) ;
- `src/environments.json` — les décors (`title`, `icon`, `description`) ;
- `docs/data/prompt.md` — le gabarit du prompt, avec les jetons `{{username}}`, `{{membres}}`,
  `{{environment}}`, `{{custom}}` et `{{subject}}` ;
- `docs/data/custom.md` — l'exemple d'instructions additionnelles, inséré à la demande via le
  bouton « Exemple » (aucune instruction n'est pré-remplie par défaut).

Ajouter un compagnon ou un environnement ne demande donc qu'une entrée JSON : l'interface et le
prompt suivent. Le jeton `{{username}}` est remplacé partout, y compris à l'intérieur des fiches.
Une section `##` dont le corps se réduit à un jeton vide (« Autres instructions », « Le sujet
de … ») est retirée du prompt final plutôt que laissée en titre orphelin.
