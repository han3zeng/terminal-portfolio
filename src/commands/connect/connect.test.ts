import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { connectText, parseConnectArgs } from "./connect";

// The code block under `### connect — CMD-CONNECT` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### connect — CMD-CONNECT");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-CONNECT");
  return match[1].replace(/\n$/, "");
}

describe("connect output", () => {
  it("TC-CMD-CONNECT-1: the plain-text rendering is exactly the PRD's block, and the usage block is its last three lines", () => {
    const block = prdBlock();
    expect(connectText("list")).toBe(block);
    expect(connectText("usage")).toBe(block.split("\n").slice(-3).join("\n"));
    expect(connectText("usage").startsWith("USAGE\n")).toBe(true);
  });
});

describe("parseConnectArgs", () => {
  it("TC-CMD-CONNECT-2: no arguments lists; `go 1`–`go 3` give the link's URL", () => {
    expect(parseConnectArgs([])).toEqual({ kind: "list" });
    expect(parseConnectArgs(["go", "1"])).toEqual({
      kind: "go",
      url: "https://substack.com/@han3zeng",
    });
    expect(parseConnectArgs(["go", "2"])).toEqual({
      kind: "go",
      url: "https://github.com/han3zeng",
    });
    expect(parseConnectArgs(["go", "3"])).toEqual({
      kind: "go",
      url: "https://www.linkedin.com/in/han3zeng",
    });
  });

  it("TC-CMD-CONNECT-3: anything else is usage", () => {
    for (const args of [
      ["go"],
      ["go", "0"],
      ["go", "4"],
      ["go", "01"],
      ["go", "+1"],
      ["go", "1.0"],
      ["go", "1", "x"],
      ["foo"],
      ["GO", "1"],
    ]) {
      expect({ args, result: parseConnectArgs(args) }).toEqual({
        args,
        result: { kind: "usage" },
      });
    }
  });
});
