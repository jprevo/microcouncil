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
}

/** Construit le prompt final à partir du gabarit de docs/data/prompt.md. */
export function buildPrompt(input: PromptInput): string {
  const username = input.username.trim() === '' ? USERNAME_FALLBACK : input.username.trim();
  const custom = input.customInstructions.trim();

  const compagnons =
    input.members.length > 0
      ? input.members.map(renderMember).join('\n\n')
      : '_Aucun compagnon sélectionné._';
  const environment =
    input.environment === null ? '_Aucun environnement sélectionné._' : renderEnvironment(input.environment);

  let output = PROMPT_TEMPLATE;
  output = fill(output, 'compagnons', compagnons);
  output = fill(output, 'environment', environment);
  output = fill(output, 'custom', custom);
  // En dernier : le nom peut aussi apparaître dans les fiches et l'environnement.
  output = fill(output, 'username', username);

  // Une section « Autres instructions » vide n'apporte rien au modèle.
  output = output.replace(/\n*##\s*Autres instructions\s*\n+(?=\n*$)/u, '\n');

  return `${output.trimEnd()}\n`;
}
