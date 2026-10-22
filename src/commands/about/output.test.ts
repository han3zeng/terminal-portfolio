import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ABOUT_OUTPUT } from "./output";

// The code block under `### about — CMD-ABOUT` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### about — CMD-ABOUT");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-ABOUT");
  return match[1].replace(/\n$/, "");
}

describe("about output", () => {
  it("TC-CMD-ABOUT-1: the output is exactly the PRD's block", () => {
    expect(ABOUT_OUTPUT).toBe(prdBlock());
  });
});
