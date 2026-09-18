import { describe, expect, it } from "vitest";
import { buildPrompt } from "./prompt";
import type { PromptInput } from "./prompt";
import { dynamic, member, promptStrings, template } from "./test/fixtures";

const input: PromptInput = {
  username: " Camille ",
  members: [member],
  dynamic,
  customInstructions: " Give examples. ",
  subject: " A garden. ",
};

describe("buildPrompt", () => {
  it("renders the complete council without catalog-only metadata", () => {
    expect(buildPrompt(input, template, promptStrings)).toBe(
      `# Council for Camille

## Members
### 🔬 Ada
Scientist. Help Camille question assumptions.
Personality: Curious, Precise

## Dynamic
### 💡 Brainstorm
Build on one another's ideas with Camille.

## Instructions
Give examples.

## Subject
A garden.
`,
    );
  });

  it("uses fallback wording when the name, members and dynamic are absent", () => {
    const output = buildPrompt(
      { ...input, username: " \n ", members: [], dynamic: null },
      template,
      promptStrings,
    );
    expect(output).toContain("# Council for the user");
    expect(output).toContain("## Members\nChoose experts.");
    expect(output).toContain("## Dynamic\nChoose a group dynamic.");
  });

  it.each([
    ["", "A garden.", "## Instructions", "## Subject\nA garden."],
    ["Give examples.", " \n ", "## Subject", "## Instructions\nGive examples."],
    [" \t ", "", "## Instructions", "## Dynamic"],
  ])(
    "omits empty optional sections (%j, %j)",
    (customInstructions, subject, absent, retained) => {
      const output = buildPrompt(
        { ...input, customInstructions, subject },
        template,
        promptStrings,
      );
      expect(output).not.toContain(absent);
      expect(output).toContain(retained);
      if (subject.trim() === "") expect(output).not.toContain("## Subject");
      expect(output).not.toMatch(/\{\{(?:custom|subject)\}\}/);
    },
  );

  it("preserves literal replacement characters and user Markdown headings", () => {
    const subject = "## My heading\nBudget: $& / $1 / $$ / $` / $' 🪴";
    const output = buildPrompt(
      { ...input, subject, customInstructions: "" },
      template,
      promptStrings,
    );
    expect(output).toContain(`## Subject\n${subject}\n`);
  });

  it("keeps member order and omits the personality line when traits are empty", () => {
    const output = buildPrompt(
      { ...input, members: [{ ...member, name: "Zoe", traits: [] }, member] },
      template,
      promptStrings,
    );
    expect(output.indexOf("### 🔬 Zoe")).toBeLessThan(
      output.indexOf("### 🔬 Ada"),
    );
    expect(output.match(/Personality:/g)).toHaveLength(1);
  });
});
