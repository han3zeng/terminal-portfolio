import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  GRAPHIC,
  GRAPHIC_COLS,
  GRAPHIC_ROWS,
  NARROW_BANNER,
  TEXT_LINES,
  WIDE_BANNER,
} from "./art";

// The code blocks under `### welcome — CMD-WELCOME` in the PRD:
// [0] description (wide banner, two blank lines, two text lines), [1] narrow banner, [2] graphic.
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
  it("TC-CMD-WELCOME-1: the banners, graphic and text lines equal the PRD's blocks", () => {
    const blocks = prdWelcomeBlocks();
    expect(blocks).toHaveLength(3);
    const [description, narrow, graphic] = blocks.map(lines);

    expect(lines(WIDE_BANNER)).toEqual(description.slice(0, 5));
    expect(description.slice(5, 7)).toEqual(["", ""]);
    expect([...TEXT_LINES]).toEqual(description.slice(7));
    expect(lines(NARROW_BANNER)).toEqual(narrow);
    expect(lines(GRAPHIC)).toEqual(graphic);
  });

  it("TC-CMD-WELCOME-2: the graphic is 40×38, the narrow banner 25 wide, and no art line has trailing spaces", () => {
    const widest = (s: string) => Math.max(...lines(s).map((l) => l.length));
    expect(lines(GRAPHIC)).toHaveLength(40);
    expect(widest(GRAPHIC)).toBe(38);
    expect([GRAPHIC_ROWS, GRAPHIC_COLS]).toEqual([40, 38]);
    expect(widest(NARROW_BANNER)).toBe(25);
    for (const art of [WIDE_BANNER, NARROW_BANNER, GRAPHIC]) {
      expect(lines(art).filter((l) => l !== l.trimEnd())).toEqual([]);
    }
  });
});
