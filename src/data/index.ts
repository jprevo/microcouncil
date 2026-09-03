import type { Environment, Member } from "../types";
import membersJson from "./members.json";
import environmentsJson from "./environments.json";
import promptTemplateRaw from "../../docs/data/prompt.md?raw";
import customExampleRaw from "../../docs/data/custom.md?raw";

export const MEMBERS: readonly Member[] = membersJson;
export const ENVIRONMENTS: readonly Environment[] = environmentsJson;

/** The prompt template: single source of truth, shared with the documentation. */
export const PROMPT_TEMPLATE: string = promptTemplateRaw.trim();

/** Sample extra instructions, dropped in on demand by the "Exemple" button. */
export const CUSTOM_EXAMPLE: string = customExampleRaw.trim();
