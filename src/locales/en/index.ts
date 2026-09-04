import catalogMembers from "../../catalog/members.json";
import catalogEnvironments from "../../catalog/environments.json";
import memberText from "./members.json";
import environmentText from "./environments.json";
import metaJson from "./meta.json";
import uiJson from "./ui.json";
import promptTemplateRaw from "./prompt.md?raw";
import customExampleRaw from "./custom.md?raw";
import type { LocaleBundle, LocaleMeta, UiStrings } from "../../locale/types";

const meta: LocaleMeta = {
  code: "en",
  label: "English",
  htmlLang: "en",
  dir: "ltr",
  ...metaJson,
};

const ui = uiJson as UiStrings;

const members = catalogMembers.map(({ id, icon }) => ({
  id,
  icon,
  ...memberText[id as keyof typeof memberText],
}));

const environments = catalogEnvironments.map(({ id, icon }) => ({
  id,
  icon,
  ...environmentText[id as keyof typeof environmentText],
}));

export const bundle: LocaleBundle = {
  meta,
  ui,
  members,
  environments,
  promptTemplate: promptTemplateRaw.trim(),
  customExample: customExampleRaw.trim(),
};
