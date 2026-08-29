# Micro-conseil

Générateur de prompt pour convoquer un conseil de compagnons dans Claude, ChatGPT, Gemini
ou n'importe quel autre assistant.

L'interface permet de choisir son nom, les membres du conseil (à la main ou tirés au sort),
un environnement (idem) et des instructions additionnelles optionnelles. Le prompt est
reconstruit en direct à partir du gabarit `docs/data/prompt.md`, puis copié en un clic.

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

## Sources de données

Tout le contenu éditorial vit hors du code :

- `src/members.json` — le catalogue des compagnons (`name`, `icon`, `job`, `description`, `traits`) ;
- `src/environments.json` — les décors (`title`, `icon`, `description`) ;
- `docs/data/prompt.md` — le gabarit du prompt, avec les jetons `{{username}}`, `{{compagnons}}`,
  `{{environment}}` et `{{custom}}` ;
- `docs/data/custom.md` — l'exemple d'instructions additionnelles proposé au premier lancement.

Ajouter un compagnon ou un environnement ne demande donc qu'une entrée JSON : l'interface et le
prompt suivent. Le jeton `{{username}}` est remplacé partout, y compris à l'intérieur des fiches.
Si la section « Autres instructions » est vide, elle est retirée du prompt final.
