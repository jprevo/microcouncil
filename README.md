# Micro Council

Générateur de prompt pour convoquer un conseil de compagnons dans Claude, ChatGPT, Gemini
ou n'importe quel autre assistant.

L'interface permet de choisir son nom, les membres du conseil, un environnement, des
instructions additionnelles optionnelles et le sujet de la demande (optionnel lui aussi). Le
prompt est reconstruit en direct à partir du gabarit `prompt.md` de la langue active, puis copié
en un clic.

Le site est **international** : anglais par défaut (`/`), français sur `/fr`, une
page HTML par langue avec ses propres balises `<title>`, `description` et Open Graph — voir
[Internationalisation](#internationalisation).

Les membres **et les environnements** se créent et se modifient depuis l'interface, de la même
façon : le bouton en bas de la liste ouvre une fiche vierge, le crayon d'une carte ouvre la fiche
correspondante. L'icône se cherche par son nom Unicode (`brain`, `rocket`…) dans la table
[`emoji-test.txt`](https://unicode.org/Public/emoji/latest/emoji-test.txt) du standard. Une fiche livrée avec le
site peut être réécrite comme n'importe quelle autre ; elle gagne alors un bouton « Revenir à
l'original », tandis qu'une fiche créée peut être supprimée.

Nom, sélection, instructions, thème et fiches ajoutées ou modifiées sont mémorisés dans le
`localStorage` du navigateur.

Un conseil peut aussi être **rangé sous un nom**. Les deux gestes vivent ensemble dans la barre
du haut, parce qu'ils portent sur le conseil et non sur le prompt produit : « Sauvegarder »
enregistre nom, instructions, sujet et **les fiches elles-mêmes** dans le `localStorage`,
« Charger » en rouvre la liste — les emoji des membres en tête de chaque ligne donnent à
reconnaître un conseil d'un coup d'œil — pour le rappeler ou l'effacer. Cent sauvegardes au
plus : au-delà, la plus ancienne cède sa place. Seul le thème ne voyage pas : c'est un réglage
d'affichage, pas une pièce du conseil.

Une sauvegarde est un **instantané fidèle**. Recharger un conseil rétablit ses fiches telles
qu'elles étaient : une fiche renommée ou réécrite depuis reprend sa version d'alors, une fiche
supprimée revient dans le catalogue. C'est un choix assumé — le conseil enregistré prime sur les
retouches faites depuis sur ces fiches précises.

Le pied de page porte enfin l'**export** et l'**import** de toutes vos données, en JSON. L'export
range les réglages, le thème, les fiches ajoutées ou modifiées et les sauvegardes dans un fichier
`microcouncil-AAAA-MM-JJ.json`, qui se relit sur un autre navigateur ou après un nettoyage du
stockage. Le fichier porte un numéro de version de format et sa date d'export : de quoi bâtir la
rétrocompatibilité quand le modèle bougera, un fichier venu d'une version inconnue étant refusé
plutôt que lu à moitié. Chacun des deux boutons ouvre une boîte qui dit d'abord ce qu'il va
faire : l'export annonce ce que le fichier emporte, l'import annonce ce que le fichier contient et
avertit qu'il **écrase toutes les données** de ce navigateur. Rien n'est écrit avant le clic de
confirmation, et un fichier importé passe la validation avant même d'être annoncé — la même
relecture défensive que le stockage local, donc une fiche illisible est écartée sans contaminer
le reste.

## Commandes

```bash
npm install
```

| Commande            | Effet                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`       | Serveur de développement Vite (régénère d'abord les pages et les cartes de partage, voir `npm run pages` et `npm run og`).                                                                                                                                                                                                                                             |
| `npm run pages`     | **Régénère `src/*.html`, `src/entries/*.tsx`, `src/public/robots.txt` et `src/public/sitemap.xml`** : une page et un point d'entrée par langue de `src/locales/registry.json`, plus les deux fichiers que lisent les robots. Sortie générée, non commitée — voir [Internationalisation](#internationalisation) et [Indexation et pré-rendu](#indexation-et-pré-rendu). |
| `npm run og`        | **Régénère `src/public/og/*.png`** : une carte de partage social par langue, recopiée dans `dist/og/` par Vite. Sortie générée, non commitée — voir [Partage social](#partage-social).                                                                                                                                                                                 |
| `npm run typecheck` | Vérification TypeScript stricte, sans émission.                                                                                                                                                                                                                                                                                                                        |
| `npm run gate`      | **Le gate** : `format:check`, `lint`, `typecheck`, `knip` à la suite. Doit passer avant toute fusion — la CI le rejoue sur `main` et sur chaque PR.                                                                                                                                                                                                                    |
| `npm run lint`      | ESLint (TypeScript typé, React Hooks, SonarJS). `npm run lint:fix` corrige ce qui est corrigible.                                                                                                                                                                                                                                                                      |
| `npm run format`    | Prettier sur tout le dépôt. `npm run format:check` se contente de vérifier.                                                                                                                                                                                                                                                                                            |
| `npm run knip`      | Fichiers, exports et dépendances jamais utilisés.                                                                                                                                                                                                                                                                                                                      |
| `npm run build`     | **Produit `dist/`** : régénère les pages et les cartes de partage, typecheck strict, build de production (une entrée Rollup par langue, HTML/CSS/JS avec empreinte), puis pré-rendu (`postbuild`).                                                                                                                                                                     |
| `npm run prerender` | **Remplit le balisage des pages de `dist/`** : le site dit ce qu'il est sans exécuter de JavaScript. Lancé par `npm run build` — voir [Indexation et pré-rendu](#indexation-et-pré-rendu).                                                                                                                                                                             |
| `npm run preview`   | Sert `dist/` en local, pour vérifier le build de production avant livraison.                                                                                                                                                                                                                                                                                           |
| `npm run skill`     | **Régénère `skill/`** : le skill agent (français), à jour des compagnons, des environnements et du gabarit.                                                                                                                                                                                                                                                            |
| `npm run emoji`     | **Régénère `src/catalog/emoji.json`** : la table `nom -> caractère` du sélecteur d'icônes, partagée par toutes les langues.                                                                                                                                                                                                                                            |
| `npm run shuffle`   | Mélange l'ordre de `src/catalog/members.json` — le même ordre pour toutes les langues, puisque le texte suit l'`id`.                                                                                                                                                                                                                                                   |

`dist/` est un site statique ordinaire : à déposer tel quel derrière n'importe quel serveur
de fichiers (ou sur GitHub Pages, Netlify…). Les chemins sont relatifs, donc il fonctionne
aussi bien à la racine d'un domaine que dans un sous-répertoire — à la seule exception de ce que
lisent les robots (balises de partage social, `canonical`, `hreflang`), qui porte une adresse
absolue faute de quoi ni l'aperçu ni l'indexation ne tiendraient (voir
[Partage social](#partage-social)). Rien n'est chargé depuis un tiers à
l'exécution : polices, données et gabarit sont embarqués dans le build.

```bash
npm run build
npm run preview
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

L'interface est une application **React 19 + TypeScript**, compilée par Vite en un site statique
dans `dist/` (React inclus dans le bundle : aucune requête vers un tiers à l'exécution).

Le découpage privilégie des composants très courts, à responsabilité unique :

- `src/locale/` — le contexte de langue : `LocaleProvider` construit les deux catalogues
  (`createCatalogs`) à partir du `LocaleBundle` actif et les met à disposition, avec le bundle
  lui-même, via `useLocale()` ; `useT()` raccourcit l'accès aux chaînes d'interface. C'est aussi
  là que vit le choix de la langue — `registry.ts` (la liste), `preference.ts` (le choix retenu),
  `redirect.ts` (l'atterrissage) — voir [Internationalisation](#internationalisation) ;
- `src/state/` — `reducer.ts` (`createReducer(catalogues)` : toutes les transitions, liées aux
  catalogues de la langue active), `AppStateProvider.tsx` (état + persistance), `selectors.ts` et
  `usePrompt.ts` (dérivations mémoïsées). L'état et le `dispatch` voyagent dans deux contextes
  distincts, pour que les composants qui n'écrivent que via `dispatch` ne se re-rendent pas à
  chaque frappe ;
- `src/components/ui/` — les primitives sans logique métier (`Button`, `Card`, `TextField`…) ;
- `src/components/tiles/` — la coquille commune aux fiches (`Tile`) et ses fragments ;
- `src/components/editor/` — ce que partagent les deux formulaires d'édition : la coquille de la
  boîte de dialogue (`EntryEditor`), le sélecteur d'icônes, le brouillon (`useDraftForm`) et
  l'ouverture de la boîte (`useEditorModal`) ;
- `src/components/<domaine>/` — une carte par section du formulaire (`members`, `environments`,
  `identity`, `custom`, `subject`, `output`), chacune accompagnée de ses propres hooks
  (`useEnvironmentKeys`, `useMemberDraft`, `useCopyPrompt`…) ;
- `src/saves/` — les conseils enregistrés : la relecture défensive du stockage (`storage.ts`) et
  le contexte qui les tient à part de l'état de l'application, pour que les modifier ne rejoue pas
  le prompt et que taper dans le sujet ne réécrive pas la liste ;
- `src/lib/` et `src/prompt.ts`, `src/storage.ts` — la logique pure, sans React,
  testable et réutilisable telle quelle.

Les catalogues affichés ne sont jamais `src/catalog/*.json` tels quels :
`src/lib/library.ts` superpose à un catalogue livré une **bibliothèque locale** — les fiches créées
par l'utilisateur, et les surcharges des fiches livrées, indexées par leur `id` d'origine. Cet `id`
est stable et indépendant de la langue (`src/catalog/members.json` et `environments.json` ne
portent que `id` et `icon`, dans l'ordre d'affichage ; le texte de chaque langue vit dans
`src/locales/<code>/*.json`, keyé par ce même `id`) — c'est ce qui permet de rétablir une fiche
livrée après l'avoir réécrite ou renommée, **dans n'importe quelle langue**. Une fiche renommée
reste sélectionnée : le reducer déplace la sélection en même temps que le nom.

Ce mécanisme est écrit une seule fois : `createCatalog(livrés, nomDe)` en produit une instance par
domaine (`src/lib/catalogs.ts`), et seule la lecture du champ qui porte le nom — `name` pour un
membre, `title` pour un environnement — distingue les deux. `createCatalogs(bundle)` en construit
une paire pour la langue active ; `LocaleProvider` s'en charge une fois par page. Les bibliothèques
sont enregistrées dans le `localStorage` — sous une clé par langue, `microcouncil.state.<code>.v2`,
pour qu'une surcharge écrite en français ne s'affiche jamais sur la page anglaise — et relues en
écartant les fiches illisibles, les doublons et les surcharges devenues orphelines.

Une sauvegarde ne retient pas les **noms** des fiches retenues mais les fiches entières, chacune
accompagnée de l'emplacement (`LibraryTarget`) qu'elle occupait. Le nom seul ne suffirait pas : le
renommer, le réécrire ou le supprimer amputerait toutes les sauvegardes antérieures. Au
chargement, `catalog.reinstate` réécrit chaque fiche dans son emplacement, et recrée celui-ci
lorsqu'il a disparu — fiche personnelle supprimée, ou fiche livrée retirée d'une version
ultérieure du catalogue. Le drapeau `edited` enregistré avec la fiche évite d'écrire une copie
conforme par-dessus une fiche livrée intacte, qui s'afficherait à tort comme « modifiée » : dans
ce cas la surcharge est simplement retirée.

**Une limite connue** : une fiche livrée a un identifiant stable — son `id` de catalogue — mais une
fiche personnelle est identifiée par son nom courant. Renommer une fiche personnelle puis
recharger une sauvegarde antérieure la recrée donc sous son ancien nom, à côté de la nouvelle,
au lieu de la retrouver. Le conseil reste complet, mais le catalogue gagne un doublon. Le lever
demanderait de doter les fiches personnelles, elles aussi, d'un identifiant stable.

## Internationalisation

Le site est décliné en plusieurs langues, chacune sur sa propre page HTML, sans embarquer le
contenu des autres :

- `src/locales/registry.json` liste les langues (`code`, `label`, `dir`, `default`). L'anglais
  (`en`) est la langue par défaut, servie à la racine (`/`) ; le français (`fr`) est servi sur
  `/fr`. Ajouter une langue est une entrée dans ce fichier plus un nouveau dossier
  `src/locales/<code>/` — et, si elle ne s'écrit pas en alphabet latin, une fonte dans
  `assets/fonts/` pour sa carte de partage (voir [Partage social](#partage-social)) ;
- `src/catalog/` porte ce qui est **structurel et partagé par toutes les langues** : `id` stable et
  `icon` pour chaque membre et environnement (`members.json`, `environments.json`), dans l'ordre
  d'affichage, et la table d'icônes du sélecteur (`emoji.json`, chargée à la demande — voir
  plus bas) ;
- `src/locales/<code>/` porte tout ce qui est **traduit** : `members.json` et `environments.json`
  (texte, keyé par `id`), `ui.json` (les chaînes d'interface, typées par `UiStrings` dans
  `src/locale/types.ts`), `meta.json` (titre, description, `og:locale`, format des nombres/dates,
  repli de `{{username}}`, caractères par token — voir `LocaleMeta`), `prompt.md` (le gabarit) et
  `custom.md` (l'exemple d'instructions additionnelles) ;
- `src/locales/<code>/index.ts` assemble tout ça en un `LocaleBundle`, en joignant `src/catalog/`
  et le texte de la langue par `id` ;
- `scripts/build-pages.mjs` (`npm run pages`, rejoué par `predev`/`prebuild`/`pregate`) régénère,
  pour chaque langue du registre, une page HTML (balises `<html lang dir>`, `title`, `description`,
  Open Graph et Twitter — dont la carte de partage de la langue, voir
  [Partage social](#partage-social) —, `hreflang` croisés vers chaque autre langue plus
  `x-default`) et un point d'entrée
  `src/entries/<code>.tsx` qui importe _uniquement_ le bundle de sa langue. Il écrit au passage
  `robots.txt` et un `sitemap.xml` qui liste chaque langue et ses alternatives (voir
  [Indexation et pré-rendu](#indexation-et-pré-rendu)). Ces fichiers sont
  générés — jamais commités (voir `.gitignore`) — et `vite.config.ts` lit le même registre pour
  fournir une entrée Rollup par langue à `npm run build` ;
- `scripts/pages.mjs` porte ce que ce script, le pré-rendu et le sitemap doivent nommer pareil :
  la lecture du registre, le nom du fichier d'une langue et l'adresse par laquelle on la lie ;
- `src/locale/registry.ts` relit ce même `registry.json` **côté navigateur** : c'est la seule liste
  des langues que connaît l'application (le sélecteur, la négociation, la redirection), et la seule
  donnée d'autres langues qu'une page embarque — un code, un libellé et une direction chacune.

### Choix de la langue

Trois chemins, dans cet ordre de priorité, tous décidés dans `src/locale/` :

1. **Le choix explicite.** Le sélecteur du pied de page (`LocalePicker`) écrit le code retenu dans
   le `localStorage` sous `microcouncil.locale` (`src/locale/preference.ts`) avant de naviguer vers
   la page correspondante — chaque langue étant une page, changer de langue est un chargement, pas
   un rendu. Ce choix prime sur tout le reste, à chaque visite suivante ;
2. **La langue du navigateur.** À défaut de choix enregistré, `matchLocale()` confronte
   `navigator.languages` au registre : correspondance exacte d'abord, puis première langue de même
   base — `fr-CA` tombe sur `fr`, et le jour où le registre porte une entrée régionale, `pt` tombe
   sur `pt-BR` ;
3. **La langue par défaut**, si le visiteur ne demande rien que le site parle.

`redirectToPreferredLocale()` (`src/locale/redirect.ts`) applique cette décision **avant le premier
rendu**, depuis le point d'entrée généré de la page : au moment où il s'exécute le document n'est
qu'un `#root` vide, donc un visiteur redirigé ne voit jamais passer la mauvaise langue. Seule la
page par défaut redirige — c'est l'adresse qu'on atteint en tapant le domaine, alors que `/fr` et
ses semblables sont délibérés (un lien partagé, un favori, un résultat de recherche) et les
détourner rendrait une langue impossible à lier. La navigation se fait en `replace` : la page
quittée n'a rien à faire dans l'historique.

Les URLs sont **sans extension** : le build écrit toujours `index.html` et `<code>.html`, mais rien
ne les référence sous ce nom. `localeHref()` et le `canonical`/`hreflang` de chaque page pointent
sur `/` et `/<code>`, parce que l'hébergement (Cloudflare Pages) sert `fr.html` sur `/fr` et
redirige `/fr.html` vers cette même adresse — un lien vers le fichier ne ferait que dépenser une
redirection. Un hébergement qui ne ferait pas cette correspondance demanderait de renommer les deux
(`pagePath()` dans `scripts/build-pages.mjs`, `localeHref()` dans `src/locale/registry.ts`).

La navigation du site est **relative** (`localeHref()` : `./`, `./<code>`), donc valable depuis une
racine de domaine comme depuis un sous-chemin. Le `canonical` et les `hreflang`, eux, sont
**absolus** : ils ne sont pas lus par un navigateur mais par un robot, la spécification y attend une
URL pleinement qualifiée, et Lighthouse refuse une adresse relative (« N'est pas une URL absolue »).
Ils sont bâtis sur la même adresse de site que les cartes de partage — voir
[L'adresse absolue](#ladresse-absolue) —, donc `SITE_URL` les déplace aussi.

Étant absolus, ces `<link>` n'ont plus besoin de `vite-ignore` : Vite ne touche pas à un href
`http(s)`. Tant qu'ils étaient relatifs il le leur fallait, faute de quoi tout `link[href]` est pris
pour un actif — le `canonical` faisait recopier la page dans `dist/assets/<code>-<empreinte>.html` et
pointait sur cette copie, chaque page déclarant donc une URL canonique qui n'était ni la sienne ni
destinée à être indexée. Tout `<link>` relatif ajouté ici en aurait de nouveau besoin.

Ajouter une langue ne demande donc de toucher à rien de tout ça : le sélecteur, la négociation et
la redirection sortent du registre.

Chaque page ne charge donc que le JavaScript de sa propre langue : Rollup découpe un chunk par
langue plus un chunk commun (React, composants, logique), et rien n'oblige une page anglaise à
télécharger la moindre chaîne française. La table d'emoji (~55 Ko, un seul jeu de noms
anglais partagé par toutes les langues — ce sont les noms Unicode officiels, pas du texte à
traduire) suit le même principe à l'échelle de la page : `import()` dynamique dans
`src/lib/emoji.ts`, chargée seulement à l'ouverture du sélecteur d'icônes.

Le `localStorage` est cloisonné par langue (`microcouncil.state.<code>.v2`,
`microcouncil.saves.<code>.v3`) : un conseil composé en français n'apparaît jamais sur la page
anglaise, et réciproquement. Seule exception, la langue choisie à la main (`microcouncil.locale`),
qui n'appartient par nature à aucune page en particulier. Un export (`microcouncil-AAAA-MM-JJ.json`) porte désormais un champ
`locale` ; l'import prévient si le fichier vient d'une autre langue que la page sur laquelle il est
importé, mais ne bloque pas l'opération.

Le skill agent (`skill/`, voir plus bas) reste **en français** pour l'instant, indépendamment de la
langue du site : `npm run skill` lit toujours `src/locales/fr/`.

## Partage social

Un lien collé dans Slack, Discord, WhatsApp, Mastodon, Bluesky, LinkedIn ou X n'affiche pas la
page : il affiche ce que les balises de son en-tête en disent, et l'image qu'elles désignent. Les
deux sont produites à la construction, une par langue :

- `scripts/build-og.mjs` (`npm run og`, rejoué par `predev`/`prebuild`) **dessine les cartes** :
  un PNG 1200 × 630 par langue dans `src/public/og/<code>.png`, que Vite recopie tel quel dans
  `dist/og/`. Fond sombre — la palette de `[data-theme="dark"]`, parce qu'une carte se voit une
  fois, en vignette, dans le fil de quelqu'un d'autre, et que le fond sombre est ce qui en fait une
  forme plutôt qu'un rectangle blanc de plus —, la marque, le titre du site, le lede et l'adresse
  en pied. Le logo n'y est pas redessiné : les cercles sont relus dans `src/assets/logo-dark.svg`,
  donc la carte ne peut pas diverger du site ;
- `scripts/build-pages.mjs` **écrit les balises** qui pointent dessus : `og:*` (dont `og:image`
  avec ses dimensions et son texte alternatif, `og:url`, `og:locale` et les `og:locale:alternate`
  des autres langues), `twitter:card` en `summary_large_image`, et les deux `theme-color`
  clair/sombre ;
- `scripts/share.mjs` porte ce que les deux doivent savoir à l'identique : la géométrie des cartes,
  leur chemin, et l'adresse du site.

### L'adresse absolue

Tout ce que le navigateur charge est relatif — `base: "./"`, liens du sélecteur de langue — pour
qu'un même `dist/` fonctionne à la racine d'un domaine comme dans un sous-répertoire. Ce que lisent
les robots ne le peut pas : celui qui fabrique l'aperçu a récupéré les balises hors contexte et ne
résout rien contre la page. `og:image`, `og:url`, ainsi que le `canonical` et les `hreflang`, sont
donc absolus, bâtis sur le `homepage` de `package.json` — que `SITE_URL` remplace le temps d'une
prévisualisation ou d'un fork :

```bash
SITE_URL=https://preview.example.com npm run build
```

Une valeur fausse n'abîme que l'aperçu et l'indexation : rien de ce que le navigateur charge n'en
dépend.

### Une carte par langue, sans retouche

Un lede fait deux lignes dans une langue et cinq dans la suivante ; une carte dont le texte est
placé à la main n'est juste que dans la langue pour laquelle on l'a réglée. Rien n'y est donc
positionné : le lede est **ajusté** — replié à la plus grande taille d'une échelle qui tienne
encore dans la boîte, en lignes _et_ en pixels, puis centré dans ce que le bloc-marque et le pied
lui laissent. Un lede court respire, un lede long descend d'un cran au lieu de déborder.

Les coupures passent par `Intl.Segmenter`, qui connaît les frontières de mots des langues qui
n'écrivent pas d'espaces (japonais, chinois, thaï) ; la ponctuation qui ne peut ni ouvrir ni fermer
une ligne est recollée à sa voisine avant le repli : un « français ne termine pas une ligne, un 。
japonais n'en commence pas. Une langue déclarée `dir: "rtl"` dans le registre retourne toute la
carte — bloc-marque, texte, filigrane et filet d'accent.

Reste ce qu'aucun calcul n'invente : les glyphes. Archivo ne couvre que le latin, et une langue
écrite dans un autre système a besoin de sa propre fonte. Déposer un `.ttf`/`.otf` dans
`assets/fonts/` suffit — il rejoint la pile de repli sans rien changer au script. À défaut, **la
construction s'arrête** en nommant les caractères manquants plutôt que de livrer une carte pleine
de tofu : `build-og.mjs` lit la table `cmap` des fontes pour le savoir, parce que Skia, lui,
dessine des carrés sans se plaindre.

## Indexation et pré-rendu

Une page de ce site part comme `<div id="root"></div>` et ne devient un document qu'une fois React
exécuté. Googlebot exécute le JavaScript et finit par la voir ; les robots qui lisent pour le
compte d'un assistant — GPTBot, ClaudeBot, PerplexityBot et les autres — ne l'exécutent pas. Ils
récupèrent le HTML, y lisent le texte qu'ils y trouvent, et passent à la suite en quelques
secondes. Tout ce que ce site dit vraiment — l'accroche, les compagnons avec leur métier et leurs
traits, les environnements, le gabarit du prompt — leur parvenait sous la forme d'un div vide.

`scripts/prerender.mjs` (`npm run prerender`, rejoué par `postbuild`) écrit donc ce balisage dans
les fichiers de `dist/`, une fois le build terminé. Rien n'y est chargé et rien n'y est
asynchrone : le document est une fonction pure du bundle d'une langue, ce qui est exactement la
forme qu'un rendu statique sait prendre. Le script démarre un serveur Vite en mode _middleware_ —
qui n'ouvre aucun port — et s'en sert comme d'un chargeur de modules : `ssrLoadModule` compile le
TSX, les catalogues JSON et le markdown `?raw` avec la configuration du projet, si bien que le
pré-rendu exécute les modules mêmes qu'exécutera le navigateur. Pas de second build à configurer,
pas de second jeu de règles de résolution à tenir en phase.

Cela ne tient que parce que rien, dans l'arbre, ne touche au DOM pendant le rendu :
`src/lib/json.ts` et `src/storage.ts` atteignent le stockage par `globalThis.localStorage?.`, le
thème est appliqué dans un effet, et `<dialog>` se rend côté serveur comme n'importe quel élément.
Du code ajouté ici qui lirait `document` ou `window` pendant un rendu casserait ce script — c'est
volontaire, il vaut mieux l'apprendre au build qu'en production.

### Pré-rendu pour les robots, pas hydratation

Les points d'entrée appellent toujours `createRoot`, qui **efface ce balisage** et remonte
l'application de zéro. `hydrateRoot` serait plus rapide, et n'est délibérément pas retenu.

La raison est `loadState()` dans `src/state/AppStateProvider.tsx`, lue pendant le premier rendu.
Au pré-rendu elle ne trouve pas de `localStorage` et renvoie les valeurs par défaut ; dans le
navigateur elle renvoie le nom du visiteur, son conseil et ses fiches. Hydrater l'un sur l'autre
est précisément la divergence dont React se plaint, et la contourner voudrait dire déplacer l'état
stocké dans un effet — un rendu de plus et un éclair d'application vide pour tous ceux qui
reviennent — pour gagner une peinture que cette page, entièrement interactive, ne dépense nulle
part ailleurs.

L'échange est donc assumé : le robot reçoit le document, le visiteur retrouve l'application qu'il
avait. Si la première peinture devenait un enjeu, `hydrateRoot` plus une restauration différée est
la suite, et `scripts/prerender.mjs` n'aurait pas à changer.

Une conséquence à connaître : le balisage pré-rendu est celui de l'application **au repos**. La
description d'un membre ne s'affichant que lorsqu'il est sélectionné, elle n'est pas dans le HTML —
les noms, les métiers et les traits y sont, pas les deux phrases qui les décrivent.

### robots.txt et sitemap.xml

`scripts/build-pages.mjs` les écrit dans `src/public/`, que Vite recopie tel quel à la racine de
`dist/`, à côté des cartes de partage — générés et git-ignorés comme le reste. Ils sont générés
plutôt qu'écrits à la main parce qu'ils nomment les langues : ajouter une ligne au registre doit
suffire, sans quoi la page ajoutée reste non listée jusqu'à ce que quelqu'un s'en souvienne.

Le sitemap déclare une entrée par page, chacune nommant toutes les langues où cette page existe —
les `xhtml:link` que demande le protocole, le même jeu que les `hreflang` des pages elles-mêmes.
Il ne porte pas de `<lastmod>` : rien dans ce build ne sait quand le contenu d'une page a changé
pour la dernière fois, et une date prise à l'horloge du build annoncerait toutes les pages
modifiées à chaque déploiement — un signal qu'un robot apprend à ignorer, ce qui est pire que ne
pas l'envoyer. Comme les balises de partage, les adresses qu'ils portent sont absolues et suivent
`SITE_URL` (voir [L'adresse absolue](#ladresse-absolue)).

## Sources de données

Tout le contenu éditorial vit hors du code, réparti entre le structurel (`src/catalog/`, une seule
copie) et le traduit (`src/locales/<code>/`, une copie par langue — voir
[Internationalisation](#internationalisation)) :

- `members.json` — le catalogue des compagnons ; `id` et `icon` dans `src/catalog/`, le reste
  (`name`, `job`, `description`, `traits`, `tags`) dans `src/locales/<code>/`. Les `tags` sont des
  mots-clés de recherche : ils alimentent le filtre du catalogue mais n'apparaissent jamais dans
  le prompt ;
- `environments.json` — les décors ; `id` et `icon` dans `src/catalog/`, le reste (`title`,
  `summary`, `description`) dans `src/locales/<code>/`. Le `summary` est la phrase affichée sur la
  fiche : il n'apparaît jamais dans le prompt ;
- `src/catalog/emoji.json` — la table `nom -> caractère` du sélecteur d'icônes, **produite**
  par `npm run emoji` à partir d'[`emoji-test.txt`](https://unicode.org/Public/emoji/latest/emoji-test.txt),
  le fichier qu'Unicode publie à chaque version pour dire quels emoji un clavier doit proposer et
  dans quel ordre. Chaque caractère y est écrit _entièrement qualifié_ — sélecteur de variante et
  jointures compris ; les teintes de peau, elles, sont écartées ;
- `src/locales/<code>/prompt.md` — le gabarit du prompt, avec les jetons `{{username}}`,
  `{{members}}`, `{{environment}}`, `{{custom}}` et `{{subject}}` — des jetons de code, jamais
  traduits, identiques dans chaque langue ;
- `src/locales/<code>/custom.md` — l'exemple d'instructions additionnelles, inséré à la demande via
  le bouton « Exemple » (aucune instruction n'est pré-remplie par défaut) ;
- `src/locales/<code>/ui.json` — toutes les chaînes de l'interface, y compris les formes pluriel
  (`{one, other}`, et `{zero, one, other}` là où un état « rien pour l'instant » a sa propre
  formulation).

- `skill-src/` — le contenu rédigé du skill agent, en français (`SKILL.md`,
  `scripts/microcouncil.py`, `references/`), d'où `npm run skill` produit `skill/`.

Ajouter un compagnon ou un environnement demande une entrée dans `src/catalog/` (`id`, `icon`) plus
une entrée par langue dans `src/locales/<code>/` : l'interface et le prompt suivent aussitôt, le
skill après un `npm run skill`. Le jeton `{{username}}` est remplacé partout, y compris à
l'intérieur des fiches, par le mot que la langue active utilise en repli (`usernameFallback` dans
`meta.json`) quand rien n'a été tapé. Une section `##` dont le corps se réduit à un jeton vide
(« Autres instructions », « Le sujet de … ») est retirée du prompt final plutôt que laissée en
titre orphelin.

## Licence

Le projet est publié sous **licence MIT** — le texte complet vit dans [`LICENSE`](LICENSE).
Copiez-le, modifiez-le, servez-le, revendez-le : la seule obligation est de conserver l'avis de
copyright. Le skill produit dans `skill/` porte la même licence, déclarée dans le frontmatter de
`skill-src/SKILL.md`.

Trois emprunts extérieurs voyagent avec le dépôt et gardent leur propre licence :

- **Archivo** (l'interface) et **JetBrains Mono** (les libellés et le prompt), sous SIL Open Font
  License 1.1. Elles ne sont pas seulement référencées : leurs sous-ensembles latins, en fichiers
  variables, sont encodés en base64 dans `src/fonts.css`, ce qui fait du dépôt un distributeur des
  fontes. Les textes des licences sont donc joints — [`licenses/Archivo-OFL.txt`](licenses/Archivo-OFL.txt)
  et [`licenses/JetBrainsMono-OFL.txt`](licenses/JetBrainsMono-OFL.txt) — et l'en-tête de
  `src/fonts.css` porte les avis de copyright sous forme de commentaires `@license`, que le
  minifieur préserve jusque dans `dist/`. Deux instances statiques d'Archivo (400 et 800) vivent en
  outre dans `assets/fonts/`, sous la même licence : elles ne servent qu'à dessiner les cartes de
  partage (voir [Partage social](#partage-social)) et ne partent jamais vers le navigateur, qui
  reçoit les fichiers variables de `src/fonts.css` et eux seuls.
- **`src/catalog/emoji.json`**, produit par `npm run emoji` à partir d'[`emoji-test.txt`](https://unicode.org/Public/emoji/latest/emoji-test.txt) :
  noms et points de code sont ceux du standard, publiés par Unicode® sous [licence
  Unicode](https://www.unicode.org/license.txt).

Les fiches de compagnons et d'environnements, le gabarit de prompt et l'exemple d'instructions
sont du contenu original, couvert par la même licence MIT que le code.
