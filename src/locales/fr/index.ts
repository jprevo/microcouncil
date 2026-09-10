import catalogMembers from "../../catalog/members.json";
import memberText from "./members.json";
import environmentText from "./environments.json";
import metaJson from "./meta.json";
import uiJson from "./ui.json";
import promptTemplateRaw from "./prompt.md?raw";
import customExampleRaw from "./custom.md?raw";
import type { LocaleBundle, LocaleMeta, UiStrings } from "../../locale/types";

const meta: LocaleMeta = {
  code: "fr",
  label: "Français",
  htmlLang: "fr",
  dir: "ltr",
  ...metaJson,
};

const ui = uiJson as UiStrings;

const members = catalogMembers.map(({ id, icon }) => ({
  id,
  icon,
  ...memberText[id as keyof typeof memberText],
}));

// Discussion modes currently ship in French only. Keeping their structure here
// lets the other locales retain the former setting catalog until their copy is ready.
const catalogEnvironments = [
  { id: "brainstorm", icon: "💡" },
  { id: "explain-to-me", icon: "🧑‍🏫" },
  { id: "ca-fuse", icon: "⚡" },
  { id: "roleplay", icon: "🎭" },
  { id: "change-my-mind", icon: "🧠" },
  { id: "enquete", icon: "🔎" },
] as const;

const environments = catalogEnvironments.map(({ id, icon }) => ({
  id,
  icon,
  ...environmentText[id],
}));

export const bundle: LocaleBundle = {
  meta,
  ui,
  members,
  environments,
  promptTemplate: promptTemplateRaw.trim(),
  customExample: customExampleRaw.trim(),
};
