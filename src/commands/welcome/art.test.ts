import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { NARROW_BANNER, TEXT_LINES, WIDE_BANNER } from "./art";

// The code blocks under `### welcome — CMD-WELCOME` in the PRD:
// [0] description (wide banner, two blank lines, two text lines), [1] narrow banner,
// [2] the graphic (out of scope: Han implements it by hand).
function prdWelcomeBlocks(): string[] {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### welcome — CMD-WELCOME");
  const end = prd.indexOf("\n### ", start + 1);
  const section = prd.slice(start, end);
  return [...section.matchAll(/```\n([\s\S]*?)```/g)].map(([, body]) =>
    body.replace(/\n$/, ""),
  );
}

const lines = (s: string) => s.split("\n");

describe("welcome art", () => {
  it("TC-CMD-WELCOME-1: the banners and text lines equal the PRD's blocks", () => {
    const [description, narrow] = prdWelcomeBlocks().map(lines);

    expect(lines(WIDE_BANNER)).toEqual(description.slice(0, 5));
    expect(description.slice(5, 7)).toEqual(["", ""]);
    expect([...TEXT_LINES]).toEqual(description.slice(7));
    expect(lines(NARROW_BANNER)).toEqual(narrow);
  });

  it("TC-CMD-WELCOME-2: the narrow banner is 25 wide, and no banner line has trailing spaces", () => {
    const widest = (s: string) => Math.max(...lines(s).map((l) => l.length));
    expect(widest(NARROW_BANNER)).toBe(25);
    for (const art of [WIDE_BANNER, NARROW_BANNER]) {
      expect(lines(art).filter((l) => l !== l.trimEnd())).toEqual([]);
    }
  });
});
