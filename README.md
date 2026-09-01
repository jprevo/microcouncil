# Micro Council

Générateur de prompt pour convoquer un conseil de compagnons dans Claude, ChatGPT, Gemini
ou n'importe quel autre assistant.

L'interface permet de choisir son nom, les membres du conseil, un environnement (à la main ou
tiré au sort), des instructions additionnelles optionnelles et le sujet de la
demande (optionnel lui aussi). Le prompt est reconstruit en direct à partir du gabarit
`docs/data/prompt.md`, puis copié en un clic.

Les membres se créent et se modifient depuis l'interface : le bouton en bas de la liste ouvre
une fiche vierge, le crayon d'une carte ouvre la fiche correspondante. L'icône se cherche par
shortcode (`brain`, `rocket`…) dans la table de l'[emoji cheat sheet](https://github.com/ikatyang/emoji-cheat-sheet).
Un membre livré avec le site peut être réécrit comme n'importe quel autre ; sa fiche gagne alors
un bouton « Revenir à l'original ».

Nom, sélection, instructions, thème et membres ajoutés ou modifiés sont mémorisés dans le
`localStorage` du navigateur.

## Commandes

```bash
npm install
```

| Commande            | Effet                                                                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`       | Serveur de développement Vite.                                                                                                                                                     |
| `npm run typecheck` | Vérification TypeScript stricte, sans émission.                                                                                                                                    |
| `npm run build`     | Typecheck puis build dans `dist/`.                                                                                                                                                 |
| `npm run package`   | **Produit `dist/microcouncil.html`** : un fichier unique (HTML + CSS + données + JS inlinés), sans aucune dépendance externe, à partager ou à ouvrir directement depuis le disque. |
| `npm run skill`     | **Régénère `skill/`** : le skill agent, à jour des compagnons, des environnements et du gabarit.                                                                                   |
| `npm run emoji`     | **Régénère `src/emoji.json`** : la table `shortcode -> caractère` du sélecteur d'icônes.                                                                                           |

```bash
npm run package
```

## Skill agent

`skill/` est un [skill](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
autonome : un `SKILL.md` standard, un script Python sans dépendance et une copie des données.
Il s'installe directement depuis GitHub, sans cloner le dépôt :

```bash
hermes skills install jprevo/microcouncil/skill
```

Il suit le format `SKILL.md` commun (Hermes, Claude Code, agentskills.io), donc il se copie
tel quel dans le répertoire de skills de n'importe quel autre harnais. Aucun jeton propre à
un harnais n'est nécessaire : le `SKILL.md` note les commandes avec un placeholder
`<SKILL_DIR>` et donne trois façons de le résoudre, de la substitution Hermes au repli par
recherche dans les racines d'installation usuelles. Le script se localise lui-même, donc il
tourne depuis n'importe quel répertoire courant, et la commande `where` sert de poignée de
main : elle échoue si le chemin retenu n'est pas le bon.

À l'invocation, l'agent propose trois entrées : **créer** un conseil (guidé), **charger** un
conseil déjà enregistré, ou **automatique** (l'agent compose le conseil lui-même à partir du
sujet). Un conseil créé est toujours enregistré, en JSON, dans le répertoire de données de
l'utilisateur — `%APPDATA%\microcouncil\councils` sous Windows, `~/Library/Application
Support/microcouncil/councils` sous macOS, `${XDG_DATA_HOME:-~/.local/share}/microcouncil/councils`
ailleurs, ou `$MICROCOUNCIL_HOME/councils` si la variable est définie. **Le sujet n'y est
jamais stocké** : c'est ce qui rend un conseil réutilisable d'une conversation à l'autre.

Le catalogue n'apparaît nulle part dans le `SKILL.md` : l'agent appelle `members` ou
`environments` pour obtenir des lignes `slug | nom | métier`, et ne charge jamais les fiches
complètes en contexte. Ajouter vingt compagnons ne coûte donc rien au prompt système.

Le script Python réimplémente `src/prompt.ts` à l'identique — même gabarit, même ordre de
substitution, même suppression des sections vides — pour que le prompt du skill et celui du
site soient le même texte.

### Mettre le skill à jour

```bash
npm run skill
```

`skill/` est une **sortie de build** : la commande l'efface et le réécrit à partir de
`skill-src/` (le `SKILL.md`, le script, les références) et des sources de données du dépôt.
Ne jamais l'éditer à la main. La commande refuse de livrer un fichier que le `SKILL.md` ne
cite pas — Hermes ne télécharge que les fichiers explicitement référencés, un fichier orphelin
disparaîtrait donc à l'installation. Le résultat est commité dans le dépôt : c'est ce que les
harnais téléchargent.

## Architecture

L'interface est une application **React 19 + TypeScript**, compilée par Vite puis inlinée en un
fichier unique par `vite-plugin-singlefile` (React inclus : aucune requête réseau à l'exécution).

Le découpage privilégie des composants très courts, à responsabilité unique :

- `src/state/` — `reducer.ts` (toutes les transitions), `AppStateProvider.tsx` (état + persistance),
  `selectors.ts` et `usePrompt.ts` (dérivations mémoïsées). L'état et le `dispatch` voyagent dans
  deux contextes distincts, pour que les composants qui n'écrivent que via `dispatch` ne se
  re-rendent pas à chaque frappe ;
- `src/components/ui/` — les primitives sans logique métier (`Button`, `Card`, `TextField`…) ;
- `src/components/tiles/` — la coquille commune aux fiches (`Tile`) et ses fragments ;
- `src/components/<domaine>/` — une carte par section du formulaire (`members`, `environments`,
  `identity`, `custom`, `subject`, `output`), chacune accompagnée de ses propres hooks
  (`useDrawEnvironment`, `useEnvironmentKeys`, `useCopyPrompt`…) ;
- `src/lib/` et `src/prompt.ts`, `src/random.ts`, `src/storage.ts` — la logique pure, sans React,
  testable et réutilisable telle quelle.

Le catalogue affiché n'est jamais `src/members.json` tel quel : `src/lib/catalog.ts` superpose à
ce catalogue livré une **bibliothèque locale** — les membres créés par l'utilisateur, et les
surcharges des membres livrés, indexées par leur nom d'origine. C'est ce qui permet de rétablir
une fiche livrée après l'avoir réécrite, ou renommée. Une fiche renommée reste sélectionnée : le
reducer déplace la sélection en même temps que le nom.

## Sources de données

Tout le contenu éditorial vit hors du code :

- `src/members.json` — le catalogue des compagnons (`name`, `icon`, `job`, `description`, `traits`,
  `tags`) ; les `tags` sont des mots-clés de recherche : ils alimentent le filtre du catalogue mais
  n'apparaissent jamais dans le prompt ;
- `src/environments.json` — les décors (`title`, `icon`, `description`) ;
- `src/emoji.json` — la table `shortcode -> caractère` du sélecteur d'icônes, **produite** par
  `npm run emoji` à partir de l'[emoji cheat sheet](https://github.com/ikatyang/emoji-cheat-sheet)
  (l'ordre et les shortcodes) et de l'API emoji de GitHub (les caractères eux-mêmes) ;
- `docs/data/prompt.md` — le gabarit du prompt, avec les jetons `{{username}}`, `{{membres}}`,
  `{{environment}}`, `{{custom}}` et `{{subject}}` ;
- `docs/data/custom.md` — l'exemple d'instructions additionnelles, inséré à la demande via le
  bouton « Exemple » (aucune instruction n'est pré-remplie par défaut).

- `skill-src/` — le contenu rédigé du skill agent (`SKILL.md`, `scripts/microcouncil.py`,
  `references/`), d'où `npm run skill` produit `skill/`.

Ajouter un compagnon ou un environnement ne demande donc qu'une entrée JSON : l'interface, le
prompt et le skill suivent (`npm run skill` pour ce dernier). Le jeton `{{username}}` est remplacé partout, y compris à l'intérieur des fiches.
Une section `##` dont le corps se réduit à un jeton vide (« Autres instructions », « Le sujet
de … ») est retirée du prompt final plutôt que laissée en titre orphelin.
