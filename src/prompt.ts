import type { Environment, Member } from "./types";

/** The name as the prompt will read it: what was typed, or a neutral stand-in when nothing was. */
export function resolveUsername(username: string, fallback: string): string {
  const trimmed = username.trim();
  return trimmed === "" ? fallback : trimmed;
}

/**
 * Rough characters-per-token, sourced from `LocaleMeta.charsPerToken`. BPE
 * tokenizers (Claude, GPT, Gemini) all differ, and they also split languages
 * unevenly — French runs noticeably worse than English, for instance — so the
 * figure is locale-specific and shown as an estimate only.
 */
export function estimateTokens(text: string, charsPerToken: number): number {
  return Math.ceil(text.length / charsPerToken);
}

/** Fills a placeholder without ever expanding `$&`, `$1`… patterns in the replacement. */
function fill(template: string, placeholder: string, value: string): string {
  return template.split(`{{${placeholder}}}`).join(value);
}

function renderMember(member: Member, personalityLabel: string): string {
  const lines = [
    `### ${member.icon} ${member.name}`,
    `${member.job}. ${member.description}`,
  ];
  if (member.traits.length > 0) {
    lines.push(`${personalityLabel}${member.traits.join(", ")}`);
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

/** The locale-specific fallback wording `buildPrompt` fills the template with. */
export interface PromptStrings {
  readonly usernameFallback: string;
  readonly noMembers: string;
  readonly noEnvironment: string;
  /** Precedes the comma-separated trait list, e.g. "Personality: " / "Personnalité : ". */
  readonly personalityLabel: string;
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

/** Builds the final prompt from the active locale's `prompt.md` template. */
export function buildPrompt(
  input: PromptInput,
  template: string,
  strings: PromptStrings,
): string {
  const username = resolveUsername(input.username, strings.usernameFallback);
  const custom = input.customInstructions.trim();
  const subject = input.subject.trim();

  const memberSection =
    input.members.length > 0
      ? input.members
          .map((member) => renderMember(member, strings.personalityLabel))
          .join("\n\n")
      : strings.noMembers;
  const environmentSection =
    input.environment === null
      ? strings.noEnvironment
      : renderEnvironment(input.environment);

  let output = template;
  if (custom === "") output = dropSection(output, "custom");
  if (subject === "") output = dropSection(output, "subject");

  output = fill(output, "members", memberSection);
  output = fill(output, "environment", environmentSection);
  output = fill(output, "custom", custom);
  output = fill(output, "subject", subject);
  // Last, because the name can also appear inside the entries and the setting.
  output = fill(output, "username", username);

  return `${output.trimEnd()}\n`;
}
