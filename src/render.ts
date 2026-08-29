import type { Environment, Member } from './types';

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function tileShell(icon: string): { tile: HTMLButtonElement; body: HTMLDivElement } {
  const tile = element('button', 'tile');
  tile.type = 'button';

  const iconNode = element('span', 'tile__icon', icon);
  iconNode.setAttribute('aria-hidden', 'true');

  const body = element('div', 'tile__body');

  const check = element('span', 'tile__check', '✓');
  check.setAttribute('aria-hidden', 'true');

  tile.append(iconNode, body, check);
  return { tile, body };
}

/** Fiche d'un compagnon : bouton bascule (sélection multiple). */
export function createMemberTile(member: Member): HTMLButtonElement {
  const { tile, body } = tileShell(member.icon);
  tile.dataset['name'] = member.name;
  tile.setAttribute('aria-pressed', 'false');
  tile.title = member.description;

  body.append(
    element('span', 'tile__name', member.name),
    element('span', 'tile__job', member.job),
  );

  if (member.traits.length > 0) {
    const traits = element('span', 'tile__traits');
    for (const trait of member.traits) {
      traits.append(element('span', 'trait', trait));
    }
    body.append(traits);
  }

  return tile;
}

/** Fiche d'un environnement : bouton radio (sélection unique). */
export function createEnvironmentTile(environment: Environment): HTMLButtonElement {
  const { tile, body } = tileShell(environment.icon);
  tile.dataset['title'] = environment.title;
  tile.setAttribute('role', 'radio');
  tile.setAttribute('aria-checked', 'false');
  tile.tabIndex = -1;

  body.append(
    element('span', 'tile__name', environment.title),
    element('span', 'tile__desc', environment.summary.replace(/\{\{username\}\}/gu, 'vous')),
  );

  return tile;
}
