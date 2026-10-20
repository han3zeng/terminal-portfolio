import { describe, expect, it } from "vitest";

import { parseThemesArgs } from "./parseThemesArgs";

describe("parseThemesArgs", () => {
  it("TC-THEMES-1: no arguments lists the themes", () => {
    expect(parseThemesArgs([])).toEqual({ kind: "list" });
  });

  it("TC-THEMES-2: `set <name>` selects each of the four themes", () => {
    for (const name of ["dark", "light", "matrix", "ubuntu"] as const) {
      expect(parseThemesArgs(["set", name])).toEqual({
        kind: "set",
        theme: name,
      });
    }
  });

  it("TC-THEMES-3: anything else is usage (unknown name, wrong case, missing or extra args)", () => {
    for (const args of [
      ["set", "foo"],
      ["set", "Ubuntu"],
      ["set"],
      ["foo"],
      ["set", "dark", "extra"],
      ["SET", "dark"],
    ]) {
      expect({ args, result: parseThemesArgs(args) }).toEqual({
        args,
        result: { kind: "usage" },
      });
    }
  });
});
