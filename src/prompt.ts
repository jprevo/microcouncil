import { PROMPT_TEMPLATE } from "./data";
import type { Environment, Member } from "./types";

const USERNAME_FALLBACK = "l'utilisateur";

/** The name as the prompt will read it: what was typed, or a neutral stand-in when nothing was. */
export function resolveUsername(username: string): string {
  const trimmed = username.trim();
  return trimmed === "" ? USERNAME_FALLBACK : trimmed;
}

/**
 * Average characters per token. BPE tokenizers (Claude, GPT, Gemini) all differ,
 * but they all split French at roughly 3.5 to 3.8 characters per token — noticeably
 * worse than English, which is where the familiar 4-character rule of thumb comes
 * from. The figure is shown as an estimate for that reason.
 */
const CHARS_PER_TOKEN = 3.6;

/** Rough token cost of the prompt, for guidance only. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** Fills a placeholder without ever expanding `$&`, `$1`… patterns in the replacement. */
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
 * Drops the `##` section whose whole body is this token: an empty section teaches
 * the model nothing. It runs before substitution, so text the user typed can never
 * be mistaken for a heading.
 */
function dropSection(template: string, placeholder: string): string {
  const lines = template.split("\n");
  const tokenIndex = lines.findIndex(
    (line) => line.trim() === `{{${placeholder}}}`,
  );
  if (tokenIndex === -1) return template;

  // `## ` (with the space) tells a section heading apart from an entry's `###`.
  let start = tokenIndex;
  while (start > 0 && !(lines[start] ?? "").startsWith("## ")) start -= 1;
  if (!(lines[start] ?? "").startsWith("## ")) return template;

  let end = tokenIndex + 1;
  while (end < lines.length && (lines[end] ?? "").trim() === "") end += 1;

  lines.splice(start, end - start);
  return lines.join("\n");
}

/** Builds the final prompt from the docs/data/prompt.md template. */
export function buildPrompt(input: PromptInput): string {
  const username = resolveUsername(input.username);
  const custom = input.customInstructions.trim();
  const subject = input.subject.trim();

  const memberSection =
    input.members.length > 0
      ? input.members.map(renderMember).join("\n\n")
      : "_Aucun membre sélectionné._";
  const environmentSection =
    input.environment === null
      ? "_Aucun environnement sélectionné._"
      : renderEnvironment(input.environment);

  let output = PROMPT_TEMPLATE;
  if (custom === "") output = dropSection(output, "custom");
  if (subject === "") output = dropSection(output, "subject");

  output = fill(output, "membres", memberSection);
  output = fill(output, "environment", environmentSection);
  output = fill(output, "custom", custom);
  output = fill(output, "subject", subject);
  // Last, because the name can also appear inside the entries and the setting.
  output = fill(output, "username", username);

  return `${output.trimEnd()}\n`;
}
