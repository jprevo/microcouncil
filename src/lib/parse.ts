import { asRecord, asString, asStringArray } from "./json";
import type { Environment, LibraryTarget, Member } from "../types";

/** Relit une fiche de membre enregistrée, ou null si elle n'a pas la forme attendue. */
export function asMember(value: unknown): Member | null {
  const record = asRecord(value);
  if (record === null) return null;
  const member: Member = {
    name: asString(record["name"]).trim(),
    icon: asString(record["icon"]).trim(),
    job: asString(record["job"]).trim(),
    description: asString(record["description"]).trim(),
    traits: asStringArray(record["traits"]),
    tags: asStringArray(record["tags"]),
  };
  return member.name === "" || member.icon === "" ? null : member;
}

/** Relit un environnement enregistré, ou null s'il n'a pas la forme attendue. */
export function asEnvironment(value: unknown): Environment | null {
  const record = asRecord(value);
  if (record === null) return null;
  const environment: Environment = {
    title: asString(record["title"]).trim(),
    icon: asString(record["icon"]).trim(),
    summary: asString(record["summary"]).trim(),
    description: asString(record["description"]).trim(),
  };
  return environment.title === "" || environment.icon === ""
    ? null
    : environment;
}

/** Relit l'emplacement de catalogue qu'une fiche occupait, ou null s'il est illisible. */
export function asTarget(value: unknown): LibraryTarget | null {
  const record = asRecord(value);
  if (record === null) return null;
  const kind = asString(record["kind"]);
  const name = asString(record["name"]).trim();
  if (name === "" || (kind !== "builtin" && kind !== "custom")) return null;
  return { kind, name };
}
