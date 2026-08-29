import { CUSTOM_EXAMPLE, ENVIRONMENTS, MEMBERS, findEnvironment } from './data';
import { buildPrompt, estimateTokens } from './prompt';
import { pickMany, pickOne } from './random';
import { createEnvironmentTile, createMemberTile } from './render';
import { loadState, saveState } from './storage';
import type { AppState, Member, Theme } from './types';

/* ------------------------------------------------------------------ DOM */

function el<T extends HTMLElement>(id: string, ctor: new () => T): T {
  const node = document.getElementById(id);
  if (!(node instanceof ctor)) {
    throw new Error(`Élément #${id} introuvable ou de type inattendu.`);
  }
  return node;
}

const dom = {
  themeToggle: el('theme-toggle', HTMLButtonElement),
  themeIcon: el('theme-icon', HTMLSpanElement),
  themeLabel: el('theme-label', HTMLSpanElement),
  username: el('username', HTMLInputElement),
  membersCount: el('members-count', HTMLSpanElement),
  membersFilter: el('members-filter', HTMLInputElement),
  membersGrid: el('members-grid', HTMLDivElement),
  membersEmpty: el('members-empty', HTMLParagraphElement),
  randomCount: el('random-count', HTMLInputElement),
  countMinus: el('count-minus', HTMLButtonElement),
  countPlus: el('count-plus', HTMLButtonElement),
  randomMembers: el('random-members', HTMLButtonElement),
  clearMembers: el('clear-members', HTMLButtonElement),
  environmentsGrid: el('environments-grid', HTMLDivElement),
  randomEnvironment: el('random-environment', HTMLButtonElement),
  clearEnvironment: el('clear-environment', HTMLButtonElement),
  custom: el('custom', HTMLTextAreaElement),
  subject: el('subject', HTMLTextAreaElement),
  subjectClear: el('subject-clear', HTMLButtonElement),
  customExample: el('custom-example', HTMLButtonElement),
  customClear: el('custom-clear', HTMLButtonElement),
  output: el('output', HTMLPreElement),
  outputMeta: el('output-meta', HTMLParagraphElement),
  outputWarning: el('output-warning', HTMLDivElement),
  copy: el('copy', HTMLButtonElement),
  copyLabel: el('copy-label', HTMLSpanElement),
  download: el('download', HTMLButtonElement),
  toast: el('toast', HTMLDivElement),
} as const;

/* ---------------------------------------------------------------- state */

const state: AppState = loadState();

const memberTiles = new Map<string, HTMLButtonElement>();
const environmentTiles = new Map<string, HTMLButtonElement>();

function clampCount(value: number): number {
  return Math.min(Math.max(Math.round(value), 1), MEMBERS.length);
}

function isSelected(name: string): boolean {
  return state.selectedMembers.includes(name);
}

/** Sélection triée selon l'ordre du catalogue, pour un prompt stable. */
function selectedMembers(): Member[] {
  return MEMBERS.filter((member) => isSelected(member.name));
}

function setMembers(names: readonly string[]): void {
  state.selectedMembers = MEMBERS.map((member) => member.name).filter((name) => names.includes(name));
  syncMembers();
  commit();
}

function toggleMember(name: string): void {
  setMembers(
    isSelected(name)
      ? state.selectedMembers.filter((item) => item !== name)
      : [...state.selectedMembers, name],
  );
}

function setEnvironment(title: string | null): void {
  state.selectedEnvironment = title;
  syncEnvironments();
  commit();
}

/* ----------------------------------------------------------- rendu texte */

function plural(count: number, singular: string, suffix = 's'): string {
  return count > 1 ? `${singular}${suffix}` : singular;
}

function commit(): void {
  saveState(state);
  renderOutput();
}

function renderOutput(): void {
  const members = selectedMembers();
  const environment =
    state.selectedEnvironment === null ? null : (findEnvironment(state.selectedEnvironment) ?? null);

  const prompt = buildPrompt({
    username: state.username,
    members,
    environment,
    customInstructions: state.customInstructions,
    subject: state.subject,
  });

  dom.output.textContent = prompt;

  const nombre = (value: number): string => value.toLocaleString('fr-FR');
  dom.outputMeta.textContent = `${nombre(prompt.length)} caractères · ~${nombre(
    estimateTokens(prompt),
  )} tokens`;

  const missing: string[] = [];
  if (members.length === 0) missing.push('au moins un membre');
  if (environment === null) missing.push('un environnement');
  if (state.username.trim() === '') missing.push('votre nom');

  if (missing.length === 0) {
    dom.outputWarning.hidden = true;
    dom.outputWarning.textContent = '';
  } else {
    dom.outputWarning.hidden = false;
    dom.outputWarning.textContent = `Il manque ${missing.join(', ')}.`;
  }
}

function syncMembers(): void {
  const count = state.selectedMembers.length;
  dom.membersCount.textContent = `${count} ${plural(count, 'sélectionné')}`;
  for (const [name, tile] of memberTiles) {
    tile.setAttribute('aria-pressed', String(isSelected(name)));
  }
}

function syncEnvironments(): void {
  let focusable: HTMLButtonElement | undefined;
  for (const [title, tile] of environmentTiles) {
    const checked = state.selectedEnvironment === title;
    tile.setAttribute('aria-checked', String(checked));
    tile.tabIndex = checked ? 0 : -1;
    if (checked) focusable = tile;
  }
  // Un groupe radio doit toujours garder un point d'entrée au clavier.
  if (focusable === undefined) {
    const first = environmentTiles.values().next();
    if (first.done !== true) first.value.tabIndex = 0;
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset['theme'] = theme;
  const goingDark = theme === 'light';
  dom.themeIcon.textContent = goingDark ? '🌙' : '☀️';
  dom.themeLabel.textContent = goingDark ? 'Thème sombre' : 'Thème clair';
  dom.themeToggle.setAttribute('aria-label', goingDark ? 'Passer au thème sombre' : 'Passer au thème clair');
}

/* ---------------------------------------------------------------- toast */

let toastTimer = 0;

function toast(message: string): void {
  dom.toast.textContent = message;
  dom.toast.classList.add('is-visible');
  globalThis.clearTimeout(toastTimer);
  toastTimer = globalThis.setTimeout(() => dom.toast.classList.remove('is-visible'), 2200);
}

/* --------------------------------------------------------------- filtre */

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function applyFilter(query: string): void {
  const needle = normalize(query);
  let visible = 0;

  for (const member of MEMBERS) {
    const tile = memberTiles.get(member.name);
    if (tile === undefined) continue;
    const haystack = normalize([member.name, member.job, member.description, ...member.traits].join(' '));
    const matches = needle === '' || haystack.includes(needle);
    tile.classList.toggle('is-hidden', !matches);
    if (matches) visible += 1;
  }

  dom.membersEmpty.hidden = visible > 0;
}

/* ------------------------------------------------------------ actions */

async function copyPrompt(): Promise<void> {
  const text = dom.output.textContent ?? '';
  let copied = false;

  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    // Repli pour les contextes non sécurisés (fichier local ouvert sans serveur).
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.setAttribute('readonly', '');
    scratch.style.position = 'fixed';
    scratch.style.opacity = '0';
    document.body.append(scratch);
    scratch.select();
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    scratch.remove();
  }

  if (copied) {
    dom.copy.classList.add('is-done');
    dom.copyLabel.textContent = 'Copié !';
    globalThis.setTimeout(() => {
      dom.copy.classList.remove('is-done');
      dom.copyLabel.textContent = 'Copier le prompt';
    }, 1800);
    toast('Prompt copié dans le presse-papiers');
  } else {
    toast('Copie impossible — sélectionnez le texte manuellement');
  }
}

function downloadPrompt(): void {
  const blob = new Blob([dom.output.textContent ?? ''], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = normalize(state.username).replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '');
  link.href = url;
  link.download = slug === '' ? 'microcouncil.md' : `microcouncil-${slug}.md`;
  link.click();
  URL.revokeObjectURL(url);
  toast('Prompt téléchargé');
}

/* ------------------------------------------------------------ bootstrap */

function buildGrids(): void {
  const membersFragment = document.createDocumentFragment();
  for (const member of MEMBERS) {
    const tile = createMemberTile(member);
    tile.addEventListener('click', () => toggleMember(member.name));
    memberTiles.set(member.name, tile);
    membersFragment.append(tile);
  }
  dom.membersGrid.append(membersFragment);

  const environmentsFragment = document.createDocumentFragment();
  for (const environment of ENVIRONMENTS) {
    const tile = createEnvironmentTile(environment);
    tile.addEventListener('click', () => {
      setEnvironment(state.selectedEnvironment === environment.title ? null : environment.title);
    });
    environmentTiles.set(environment.title, tile);
    environmentsFragment.append(tile);
  }
  dom.environmentsGrid.append(environmentsFragment);
}

/** Navigation aux flèches dans le groupe radio des environnements. */
function handleEnvironmentKeys(event: KeyboardEvent): void {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
  if (!keys.includes(event.key)) return;

  const titles = ENVIRONMENTS.map((environment) => environment.title);
  const current = state.selectedEnvironment === null ? -1 : titles.indexOf(state.selectedEnvironment);
  const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
  const next = titles[(current + step + titles.length) % titles.length];
  if (next === undefined) return;

  event.preventDefault();
  setEnvironment(next);
  environmentTiles.get(next)?.focus();
}

function bindEvents(): void {
  dom.username.addEventListener('input', () => {
    state.username = dom.username.value;
    commit();
  });

  dom.membersFilter.addEventListener('input', () => applyFilter(dom.membersFilter.value));

  dom.randomCount.addEventListener('change', () => {
    const parsed = Number.parseInt(dom.randomCount.value, 10);
    state.randomCount = clampCount(Number.isNaN(parsed) ? state.randomCount : parsed);
    dom.randomCount.value = String(state.randomCount);
    saveState(state);
  });

  const nudge = (delta: number): void => {
    state.randomCount = clampCount(state.randomCount + delta);
    dom.randomCount.value = String(state.randomCount);
    saveState(state);
  };
  dom.countMinus.addEventListener('click', () => nudge(-1));
  dom.countPlus.addEventListener('click', () => nudge(1));

  dom.randomMembers.addEventListener('click', () => {
    const drawn = pickMany(MEMBERS, state.randomCount).map((member) => member.name);
    setMembers(drawn);
    toast(`${drawn.length} ${plural(drawn.length, 'membre')} ${plural(drawn.length, 'tiré')} au sort`);
  });

  dom.clearMembers.addEventListener('click', () => setMembers([]));

  dom.randomEnvironment.addEventListener('click', () => {
    const others = ENVIRONMENTS.filter((environment) => environment.title !== state.selectedEnvironment);
    const drawn = pickOne(others.length > 0 ? others : ENVIRONMENTS);
    if (drawn !== undefined) {
      setEnvironment(drawn.title);
      toast(`${drawn.icon} ${drawn.title}`);
    }
  });

  dom.clearEnvironment.addEventListener('click', () => setEnvironment(null));
  dom.environmentsGrid.addEventListener('keydown', handleEnvironmentKeys);

  dom.subject.addEventListener('input', () => {
    state.subject = dom.subject.value;
    commit();
  });

  dom.subjectClear.addEventListener('click', () => {
    dom.subject.value = '';
    state.subject = '';
    commit();
    dom.subject.focus();
  });

  dom.custom.addEventListener('input', () => {
    state.customInstructions = dom.custom.value;
    commit();
  });

  dom.customExample.addEventListener('click', () => {
    dom.custom.value = CUSTOM_EXAMPLE;
    state.customInstructions = CUSTOM_EXAMPLE;
    commit();
  });

  dom.customClear.addEventListener('click', () => {
    dom.custom.value = '';
    state.customInstructions = '';
    commit();
  });

  dom.copy.addEventListener('click', () => {
    void copyPrompt();
  });
  dom.download.addEventListener('click', downloadPrompt);

  dom.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    saveState(state);
  });
}

function hydrate(): void {
  applyTheme(state.theme);
  dom.username.value = state.username;
  dom.custom.value = state.customInstructions;
  dom.subject.value = state.subject;
  dom.randomCount.max = String(MEMBERS.length);
  dom.randomCount.value = String(clampCount(state.randomCount));
  syncMembers();
  syncEnvironments();
  applyFilter('');
  renderOutput();
}

buildGrids();
bindEvents();
hydrate();
