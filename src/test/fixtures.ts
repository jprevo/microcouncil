import { createCatalog } from "../lib/library";
import { parseState } from "../storage";
import type { CouncilSave, Dynamic, Member } from "../types";

export const member: Member = {
  name: "Ada",
  icon: "🔬",
  job: "Scientist",
  description: "Help {{username}} question assumptions.",
  traits: ["Curious", "Precise"],
  tags: ["hidden-search-tag"],
};

export const dynamic: Dynamic = {
  title: "Brainstorm",
  icon: "💡",
  summary: "Develop an idea together.",
  description: "Build on one another's ideas with {{username}}.",
};

export const catalogs = {
  memberCatalog: createCatalog(
    [{ id: "ada", item: member }],
    (item) => item.name,
    (item, name) => ({ ...item, name }),
  ),
  dynamicCatalog: createCatalog(
    [{ id: "brainstorm", item: dynamic }],
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
  dynamic: {
    target: { kind: "builtin", id: "brainstorm" },
    item: dynamic,
    edited: false,
  },
  customInstructions: "Give concrete examples.",
  subject: "Design a garden.",
};

export const template = `# Council for {{username}}

## Members
{{members}}

## Dynamic
{{dynamic}}

## Instructions
{{custom}}

## Subject
{{subject}}`;

export const promptStrings = {
  usernameFallback: "the user",
  noMembers: "Choose experts.",
  noDynamic: "Choose a group dynamic.",
  personalityLabel: "Personality: ",
};
