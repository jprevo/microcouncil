import { PROMPT_TEMPLATE } from './data';
import type { Environment, Member } from './types';

export const USERNAME_FALLBACK = "l'utilisateur";

/** Remplace un placeholder sans jamais interpréter les motifs `$&`, `$1`… du remplacement. */
function fill(template: string, placeholder: string, value: string): string {
  return template.split(`{{${placeholder}}}`).join(value);
}

function renderMember(member: Member): string {
  const lines = [
    `### ${member.icon} ${member.name}`,
    `${member.job}. ${member.description}`,
  ];
  if (member.traits.length > 0) {
    lines.push(`Personnalité : ${member.traits.join(', ')}`);
  }
  return lines.join('\n');
}

function renderEnvironment(environment: Environment): string {
  return `### ${environment.icon} ${environment.title}\n${environment.description}`;
}

export interface PromptInput {
  readonly username: string;
  readonly members: readonly Member[];
  readonly environment: Environment | null;
  readonly customInstructions: string;
  readonly subject: string;
}

/**
 * Retire du gabarit la section `##` dont le corps se résume à ce jeton : une section
 * restée vide n'apporte rien au modèle. Opère avant substitution, donc le contenu
 * saisi par l'utilisateur ne peut jamais être confondu avec un titre.
 */
function dropSection(template: string, placeholder: string): string {
  const lines = template.split('\n');
  const tokenIndex = lines.findIndex((line) => line.trim() === `{{${placeholder}}}`);
  if (tokenIndex === -1) return template;

  // `## ` (avec l'espace) ne peut pas confondre un titre de section et un `###` de fiche.
  let start = tokenIndex;
  while (start > 0 && !(lines[start] ?? '').startsWith('## ')) start -= 1;
  if (!(lines[start] ?? '').startsWith('## ')) return template;

  let end = tokenIndex + 1;
  while (end < lines.length && (lines[end] ?? '').trim() === '') end += 1;

  lines.splice(start, end - start);
  return lines.join('\n');
}

/** Construit le prompt final à partir du gabarit de docs/data/prompt.md. */
export function buildPrompt(input: PromptInput): string {
  const username = input.username.trim() === '' ? USERNAME_FALLBACK : input.username.trim();
  const custom = input.customInstructions.trim();
  const subject = input.subject.trim();

  const membres =
    input.members.length > 0
      ? input.members.map(renderMember).join('\n\n')
      : '_Aucun membre sélectionné._';
  const environment =
    input.environment === null ? '_Aucun environnement sélectionné._' : renderEnvironment(input.environment);

  let output = PROMPT_TEMPLATE;
  if (custom === '') output = dropSection(output, 'custom');
  if (subject === '') output = dropSection(output, 'subject');

  output = fill(output, 'membres', membres);
  output = fill(output, 'environment', environment);
  output = fill(output, 'custom', custom);
  output = fill(output, 'subject', subject);
  // En dernier : le nom peut aussi apparaître dans les fiches et l'environnement.
  output = fill(output, 'username', username);

  return `${output.trimEnd()}\n`;
}
