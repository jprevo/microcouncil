import { createCatalog } from "../lib/library";
import { parseState } from "../storage";
import type { CouncilSave, Environment, Member } from "../types";

export const member: Member = {
  name: "Ada",
  icon: "🔬",
  job: "Scientist",
  description: "Help {{username}} question assumptions.",
  traits: ["Curious", "Precise"],
  tags: ["hidden-search-tag"],
};

export const environment: Environment = {
  title: "Workshop",
  icon: "🏠",
  summary: "hidden-summary",
  description: "A quiet room for {{username}}.",
};

export const catalogs = {
  memberCatalog: createCatalog(
    [{ id: "ada", item: member }],
    (item) => item.name,
    (item, name) => ({ ...item, name }),
  ),
  environmentCatalog: createCatalog(
    [{ id: "workshop", item: environment }],
    (item) => item.title,
    (item, title) => ({ ...item, title }),
  ),
};

export const initialState = () => parseState({ theme: "light" }, catalogs);

export const savedCouncil: CouncilSave = {
  id: "council-1",
  name: "My council",
  savedAt: 1700000000000,
  username: "Camille",
  members: [
    { target: { kind: "builtin", id: "ada" }, item: member, edited: false },
  ],
  environment: {
    target: { kind: "builtin", id: "workshop" },
    item: environment,
    edited: false,
  },
  customInstructions: "Give concrete examples.",
  subject: "Design a garden.",
};

export const template = `# Council for {{username}}

## Members
{{members}}

## Environment
{{environment}}

## Instructions
{{custom}}

## Subject
{{subject}}`;

export const promptStrings = {
  usernameFallback: "the user",
  noMembers: "Choose experts.",
  noEnvironment: "Choose a setting.",
  personalityLabel: "Personality: ",
};
