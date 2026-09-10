import { describe, expect, it } from "vitest";
import { createReducer } from "./reducer";
import { parseSaves } from "../saves/storage";
import { buildPrompt } from "../prompt";
import type { CouncilSave } from "../types";
import {
  catalogs,
  environment,
  initialState,
  member,
  promptStrings,
  savedCouncil,
  template,
} from "../test/fixtures";

const reducer = createReducer(
  catalogs.memberCatalog,
  catalogs.environmentCatalog,
);

describe("saved council restoration", () => {
  it("restores untouched built-ins after renames and preserves the current theme", () => {
    let state = reducer(initialState(), {
      type: "saveMember",
      target: { kind: "builtin", id: "ada" },
      member: { ...member, name: "Renamed", description: "Changed" },
    });
    state = reducer(state, {
      type: "saveEnvironment",
      target: { kind: "builtin", id: "workshop" },
      environment: { ...environment, title: "Renamed room" },
    });
    state = reducer(state, { type: "toggleTheme" });
    const before = structuredClone(state);
    const restored = reducer(state, {
      type: "loadCouncil",
      council: savedCouncil,
    });
    expect(restored).toEqual({
      ...initialState(),
      theme: "dark",
      username: savedCouncil.username,
      subject: savedCouncil.subject,
      customInstructions: savedCouncil.customInstructions,
      selectedMembers: [member.name],
      selectedEnvironment: environment.title,
    });
    expect(state).toEqual(before);
  });

  it("reinstates saved built-in edits over newer changes", () => {
    const edited = {
      ...member,
      name: "Ada saved",
      description: "Saved description",
    };
    const council: CouncilSave = {
      ...savedCouncil,
      members: [
        { target: { kind: "builtin", id: "ada" }, item: edited, edited: true },
      ],
    };
    const state = reducer(initialState(), {
      type: "saveMember",
      target: { kind: "builtin", id: "ada" },
      member: { ...member, description: "New description" },
    });
    const restored = reducer(state, { type: "loadCouncil", council });
    expect(restored.memberLibrary.overrides).toEqual({ ada: edited });
    expect(restored.selectedMembers).toEqual([edited.name]);
  });

  it("recreates deleted custom entries from a serialized save and regenerates the prompt", () => {
    const customMember = {
      ...member,
      name: "Custom expert",
      description: "Original expertise",
    };
    const customEnvironment = {
      ...environment,
      title: "Custom room",
      description: "Original atmosphere",
    };
    const council: CouncilSave = {
      ...savedCouncil,
      members: [
        {
          target: { kind: "custom", name: customMember.name },
          item: customMember,
          edited: false,
        },
      ],
      environment: {
        target: { kind: "custom", name: customEnvironment.title },
        item: customEnvironment,
        edited: false,
      },
    };
    let state = reducer(initialState(), {
      type: "saveMember",
      target: null,
      member: customMember,
    });
    state = reducer(state, {
      type: "saveEnvironment",
      target: null,
      environment: customEnvironment,
    });
    state = reducer(state, { type: "members", names: [customMember.name] });
    state = reducer(state, {
      type: "environment",
      title: customEnvironment.title,
    });
    const [saved] = parseSaves(JSON.parse(JSON.stringify([council])));
    if (saved === undefined) throw new Error("The serialized council was lost");
    state = reducer(state, {
      type: "deleteMember",
      target: { kind: "custom", name: customMember.name },
    });
    state = reducer(state, {
      type: "deleteEnvironment",
      target: { kind: "custom", name: customEnvironment.title },
    });
    expect(state.selectedMembers).toEqual([]);
    expect(state.selectedEnvironment).toBeNull();
    const restored = reducer(state, { type: "loadCouncil", council: saved });
    const members = catalogs.memberCatalog
      .build(restored.memberLibrary)
      .filter((entry) => restored.selectedMembers.includes(entry.name));
    const setting =
      catalogs.environmentCatalog
        .build(restored.environmentLibrary)
        .find((entry) => entry.title === restored.selectedEnvironment) ?? null;
    expect(restored.memberLibrary.custom).toEqual([customMember]);
    expect(restored.environmentLibrary.custom).toEqual([customEnvironment]);
    expect(
      buildPrompt(
        { ...restored, members, environment: setting },
        template,
        promptStrings,
      ),
    ).toBe(
      buildPrompt(
        { ...council, members: [customMember], environment: customEnvironment },
        template,
        promptStrings,
      ),
    );
  });

  it("recreates a saved built-in after its id leaves the shipped catalog", () => {
    const retiredEnvironment = {
      ...environment,
      title: "Retired setting",
    };
    const council: CouncilSave = {
      ...savedCouncil,
      environment: {
        target: { kind: "builtin", id: "retired-setting" },
        item: retiredEnvironment,
        edited: false,
      },
    };

    const restored = reducer(initialState(), {
      type: "loadCouncil",
      council,
    });

    expect(restored.selectedEnvironment).toBe(retiredEnvironment.title);
    expect(restored.environmentLibrary.custom).toEqual([retiredEnvironment]);
  });

  it("preserves conflicting entries and selects the restored entry under a free name", () => {
    const occupied = {
      ...member,
      name: "Saved name",
      description: "Keep this expertise",
    };
    const state = reducer(initialState(), {
      type: "saveMember",
      target: null,
      member: occupied,
    });
    const council: CouncilSave = {
      ...savedCouncil,
      members: [
        {
          target: { kind: "builtin", id: "ada" },
          item: { ...member, name: "Saved name" },
          edited: true,
        },
      ],
    };
    const restored = reducer(state, { type: "loadCouncil", council });
    expect(restored.selectedMembers).toEqual(["Saved name (2)"]);
    expect(restored.memberLibrary.custom).toEqual([occupied]);
    expect(restored.memberLibrary.overrides["ada"]).toEqual({
      ...member,
      name: "Saved name (2)",
    });
  });

  it("clears the previous setting when the saved council has none", () => {
    const state = { ...initialState(), selectedEnvironment: environment.title };
    expect(
      reducer(state, {
        type: "loadCouncil",
        council: { ...savedCouncil, environment: null },
      }).selectedEnvironment,
    ).toBeNull();
  });
});
