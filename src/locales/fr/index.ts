import catalogMembers from "../../catalog/members.json";
import catalogDynamics from "../../catalog/dynamics.json";
import memberText from "./members.json";
import dynamicText from "./dynamics.json";
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

const dynamics = catalogDynamics.map(({ id, icon }) => ({
  id,
  icon,
  ...dynamicText[id as keyof typeof dynamicText],
}));

export const bundle: LocaleBundle = {
  meta,
  ui,
  members,
  dynamics,
  promptTemplate: promptTemplateRaw.trim(),
  customExample: customExampleRaw.trim(),
};
