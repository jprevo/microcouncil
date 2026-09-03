import { asRecord, asString, asStringArray } from "./json";
import type { Environment, LibraryTarget, Member } from "../types";

/** Reads a stored member back, or null when it does not have the expected shape. */
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

/** Reads a stored setting back, or null when it does not have the expected shape. */
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

/** Reads back the catalog slot an entry used to fill, or null when it is unreadable. */
export function asTarget(value: unknown): LibraryTarget | null {
  const record = asRecord(value);
  if (record === null) return null;
  const kind = asString(record["kind"]);
  const name = asString(record["name"]).trim();
  if (name === "" || (kind !== "builtin" && kind !== "custom")) return null;
  return { kind, name };
}
