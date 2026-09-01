import { PROMPT_TEMPLATE } from "./data";
import type { Environment, Member } from "./types";

export const USERNAME_FALLBACK = "l'utilisateur";

/** Le nom tel qu'il se lira dans le prompt : la saisie, ou une tournure neutre si elle est vide. */
export function resolveUsername(username: string): string {
  const trimmed = username.trim();
  return trimmed === "" ? USERNAME_FALLBACK : trimmed;
}

/**
 * Nombre moyen de caractères par token. Les tokeniseurs BPE (Claude, GPT, Gemini)
 * diffèrent les uns des autres, mais découpent tous le français autour de 3,5 à 3,8
 * caractères par token — sensiblement moins bien que l'anglais, d'où vient
 * l'approximation courante de 4 caractères. L'affichage reste donc explicitement approché.
 */
const CHARS_PER_TOKEN = 3.6;

/** Estimation du coût en tokens du prompt, à titre indicatif. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

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
    lines.push(`Personnalité : ${member.traits.join(", ")}`);
  }
  return lines.join("\n");
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
  const lines = template.split("\n");
  const tokenIndex = lines.findIndex(
    (line) => line.trim() === `{{${placeholder}}}`,
  );
  if (tokenIndex === -1) return template;

  // `## ` (avec l'espace) ne peut pas confondre un titre de section et un `###` de fiche.
  let start = tokenIndex;
  while (start > 0 && !(lines[start] ?? "").startsWith("## ")) start -= 1;
  if (!(lines[start] ?? "").startsWith("## ")) return template;

  let end = tokenIndex + 1;
  while (end < lines.length && (lines[end] ?? "").trim() === "") end += 1;

  lines.splice(start, end - start);
  return lines.join("\n");
}

/** Construit le prompt final à partir du gabarit de docs/data/prompt.md. */
export function buildPrompt(input: PromptInput): string {
  const username = resolveUsername(input.username);
  const custom = input.customInstructions.trim();
  const subject = input.subject.trim();

  const membres =
    input.members.length > 0
      ? input.members.map(renderMember).join("\n\n")
      : "_Aucun membre sélectionné._";
  const environment =
    input.environment === null
      ? "_Aucun environnement sélectionné._"
      : renderEnvironment(input.environment);

  let output = PROMPT_TEMPLATE;
  if (custom === "") output = dropSection(output, "custom");
  if (subject === "") output = dropSection(output, "subject");

  output = fill(output, "membres", membres);
  output = fill(output, "environment", environment);
  output = fill(output, "custom", custom);
  output = fill(output, "subject", subject);
  // En dernier : le nom peut aussi apparaître dans les fiches et l'environnement.
  output = fill(output, "username", username);

  return `${output.trimEnd()}\n`;
}
