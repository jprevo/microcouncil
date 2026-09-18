import { describe, expect, it } from "vitest";
import { buildBackup, serializeBackup } from "./exportBackup";
import { parseBackup } from "./parseBackup";
import { BACKUP_VERSION } from "./format";
import ui from "../locales/en/ui.json";
import {
  catalogs,
  dynamic,
  initialState,
  member,
  savedCouncil,
} from "../test/fixtures";

const parse = (text: string) => parseBackup(text, catalogs, ui.backup.errors);

describe("backup export/import", () => {
  it("round-trips all user data, custom entries, overrides and saved councils", () => {
    const state = {
      ...initialState(),
      username: "Camille 🪴",
      subject: "Line 1\nLine 2",
      customInstructions: "$& and accents: été",
      theme: "dark" as const,
      selectedMembers: ["Ada edited", "Custom"],
      selectedDynamic: "Custom dynamic",
      memberLibrary: {
        custom: [{ ...member, name: "Custom" }],
        overrides: { ada: { ...member, name: "Ada edited" } },
      },
      dynamicLibrary: {
        custom: [{ ...dynamic, title: "Custom dynamic" }],
        overrides: {
          brainstorm: { ...dynamic, description: "Edited instructions" },
        },
      },
    };
    const backup = buildBackup(state, [savedCouncil], "fr", 1700000000000);
    expect(backup.exportedAt).toBe("2023-11-14T22:13:20.000Z");
    expect(parse(serializeBackup(backup))).toEqual({ ok: true, backup });
  });

  it("upgrades version 2 backups while preserving compatible data", () => {
    const backup = buildBackup(initialState(), [savedCouncil], "en", 0);
    const result = parse(JSON.stringify({ ...backup, version: 2 }));
    expect(result).toEqual({
      ok: true,
      backup: { ...backup, version: BACKUP_VERSION },
    });
  });

  it.each([
    ["{", ui.backup.errors.unreadableJson],
    ["null", ui.backup.errors.notABackup],
    ["[]", ui.backup.errors.notABackup],
    ["{}", ui.backup.errors.noVersion],
    [JSON.stringify({ version: BACKUP_VERSION }), ui.backup.errors.noState],
    [
      JSON.stringify({ version: BACKUP_VERSION, state: {} }),
      ui.backup.errors.noSaves,
    ],
  ])("rejects malformed input %s with a usable reason", (text, reason) => {
    expect(parse(text)).toEqual({ ok: false, reason });
  });

  it.each([1, BACKUP_VERSION + 1])(
    "rejects unsupported version %i",
    (version) => {
      const result = parse(JSON.stringify({ version, state: {}, saves: [] }));
      expect(result).toEqual({
        ok: false,
        reason: (version > BACKUP_VERSION
          ? ui.backup.errors.versionTooNew
          : ui.backup.errors.versionUnsupported
        ).replace("{version}", String(version)),
      });
    },
  );

  it("discards corrupt entries while preserving usable state and saves", () => {
    const backup = buildBackup(initialState(), [savedCouncil], "en", 0);
    const result = parse(
      JSON.stringify({
        ...backup,
        state: {
          ...backup.state,
          username: 42,
          selectedMembers: [member.name, "Missing"],
          selectedDynamic: "Missing",
          memberLibrary: {
            custom: [null, { ...member, name: "Valid custom" }],
            overrides: { missing: member },
          },
        },
        saves: [null, { id: "broken" }, savedCouncil],
      }),
    );
    expect(result).toEqual({
      ok: true,
      backup: {
        ...backup,
        state: {
          ...initialState(),
          selectedMembers: [member.name],
          memberLibrary: {
            custom: [{ ...member, name: "Valid custom" }],
            overrides: {},
          },
        },
      },
    });
  });
});
