import { describe, expect, it } from "vitest";

import { parseInput, resolve } from "./resolve";
import type { CommandSpec } from "./types";

const registry: CommandSpec[] = [
  { name: "about", takesArgs: false },
  { name: "help", takesArgs: false },
  { name: "themes", takesArgs: true },
];

describe("parseInput / resolve", () => {
  it("TC-TERMINAL-SHELL-1: splits trimmed input on runs of whitespace", () => {
    expect(parseInput("  connect  go   1 ")).toEqual({
      name: "connect",
      args: ["go", "1"],
    });
  });

  it("TC-TERMINAL-SHELL-2: empty or whitespace-only input resolves to empty", () => {
    for (const raw of ["", "   ", "\t"]) {
      expect(resolve(raw, registry)).toEqual({ kind: "empty" });
    }
  });

  it("TC-TERMINAL-SHELL-3: matching is case-sensitive", () => {
    expect(resolve("HELP", registry)).toEqual({ kind: "not-found" });
  });

  it("TC-TERMINAL-SHELL-4: surrounding spaces are trimmed before matching", () => {
    expect(resolve("  help  ", registry)).toEqual({
      kind: "command",
      name: "help",
      args: [],
    });
  });

  it("TC-TERMINAL-SHELL-5: a no-arg command given args resolves to usage", () => {
    expect(resolve("about foo", registry)).toEqual({
      kind: "usage",
      name: "about",
    });
  });

  it("TC-TERMINAL-SHELL-6: a command that takes args receives them", () => {
    expect(resolve("themes set x", registry)).toEqual({
      kind: "command",
      name: "themes",
      args: ["set", "x"],
    });
  });
});
