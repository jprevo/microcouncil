import type { Environment, Member } from './types';
import membersJson from './members.json';
import environmentsJson from './environments.json';
import promptTemplateRaw from '../docs/data/prompt.md?raw';
import customExampleRaw from '../docs/data/custom.md?raw';

export const MEMBERS: readonly Member[] = membersJson;
export const ENVIRONMENTS: readonly Environment[] = environmentsJson;

/** Gabarit du prompt : source unique de vérité, partagée avec la documentation. */
export const PROMPT_TEMPLATE: string = promptTemplateRaw.trim();

/** Exemple d'instructions additionnelles, inséré à la demande via le bouton « Exemple ». */
export const CUSTOM_EXAMPLE: string = customExampleRaw.trim();

export function findEnvironment(title: string): Environment | undefined {
  return ENVIRONMENTS.find((environment) => environment.title === title);
}
