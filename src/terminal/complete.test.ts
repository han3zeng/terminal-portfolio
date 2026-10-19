import { describe, expect, it } from "vitest";

import { commands } from "./commands";
import { complete } from "./complete";

const names = commands.map((c) => c.name);

describe("complete", () => {
  it("TC-TERMINAL-SHELL-7: a single match completes to the name plus a space", () => {
    expect(complete("hel", names)).toEqual({ value: "help ", hints: [] });
  });

  it("TC-TERMINAL-SHELL-8: several matches extend to the common prefix and list hints", () => {
    expect(complete("th", ["theme", "themes", "help"])).toEqual({
      value: "theme",
      hints: ["theme", "themes"],
    });
    expect(complete("h", names)).toEqual({
      value: "h",
      hints: ["help", "history"],
    });
  });

  it("TC-TERMINAL-SHELL-9: no match, empty input, or input with args changes nothing", () => {
    for (const input of ["", "xyz", "connect g"]) {
      expect(complete(input, names)).toEqual({ value: input, hints: [] });
    }
  });
});
