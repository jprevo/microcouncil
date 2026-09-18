import { describe, expect, it } from "vitest";
import { createReducer } from "./reducer";
import { parseSaves } from "../saves/storage";
import { buildPrompt } from "../prompt";
import type { CouncilSave } from "../types";
import {
  catalogs,
  dynamic,
  initialState,
  member,
  promptStrings,
  savedCouncil,
  template,
} from "../test/fixtures";

const reducer = createReducer(catalogs.memberCatalog, catalogs.dynamicCatalog);

describe("saved council restoration", () => {
  it("restores untouched built-ins after renames and preserves the current theme", () => {
    let state = reducer(initialState(), {
      type: "saveMember",
      target: { kind: "builtin", id: "ada" },
      member: { ...member, name: "Renamed", description: "Changed" },
    });
    state = reducer(state, {
      type: "saveDynamic",
      target: { kind: "builtin", id: "brainstorm" },
      dynamic: { ...dynamic, title: "Renamed dynamic" },
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
      selectedDynamic: dynamic.title,
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
    const customDynamic = {
      ...dynamic,
      title: "Custom dynamic",
      description: "Original interaction rules",
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
      dynamic: {
        target: { kind: "custom", name: customDynamic.title },
        item: customDynamic,
        edited: false,
      },
    };
    let state = reducer(initialState(), {
      type: "saveMember",
      target: null,
      member: customMember,
    });
    state = reducer(state, {
      type: "saveDynamic",
      target: null,
      dynamic: customDynamic,
    });
    state = reducer(state, { type: "members", names: [customMember.name] });
    state = reducer(state, {
      type: "dynamic",
      title: customDynamic.title,
    });
    const [saved] = parseSaves(JSON.parse(JSON.stringify([council])));
    if (saved === undefined) throw new Error("The serialized council was lost");
    state = reducer(state, {
      type: "deleteMember",
      target: { kind: "custom", name: customMember.name },
    });
    state = reducer(state, {
      type: "deleteDynamic",
      target: { kind: "custom", name: customDynamic.title },
    });
    expect(state.selectedMembers).toEqual([]);
    expect(state.selectedDynamic).toBeNull();
    const restored = reducer(state, { type: "loadCouncil", council: saved });
    const members = catalogs.memberCatalog
      .build(restored.memberLibrary)
      .filter((entry) => restored.selectedMembers.includes(entry.name));
    const restoredDynamic =
      catalogs.dynamicCatalog
        .build(restored.dynamicLibrary)
        .find((entry) => entry.title === restored.selectedDynamic) ?? null;
    expect(restored.memberLibrary.custom).toEqual([customMember]);
    expect(restored.dynamicLibrary.custom).toEqual([customDynamic]);
    expect(
      buildPrompt(
        { ...restored, members, dynamic: restoredDynamic },
        template,
        promptStrings,
      ),
    ).toBe(
      buildPrompt(
        { ...council, members: [customMember], dynamic: customDynamic },
        template,
        promptStrings,
      ),
    );
  });

  it("recreates a saved built-in after its id leaves the shipped catalog", () => {
    const retiredDynamic = {
      ...dynamic,
      title: "Retired dynamic",
    };
    const council: CouncilSave = {
      ...savedCouncil,
      dynamic: {
        target: { kind: "builtin", id: "retired-dynamic" },
        item: retiredDynamic,
        edited: false,
      },
    };

    const restored = reducer(initialState(), {
      type: "loadCouncil",
      council,
    });

    expect(restored.selectedDynamic).toBe(retiredDynamic.title);
    expect(restored.dynamicLibrary.custom).toEqual([retiredDynamic]);
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

  it("clears the previous dynamic when the saved council has none", () => {
    const state = { ...initialState(), selectedDynamic: dynamic.title };
    expect(
      reducer(state, {
        type: "loadCouncil",
        council: { ...savedCouncil, dynamic: null },
      }).selectedDynamic,
    ).toBeNull();
  });
});
