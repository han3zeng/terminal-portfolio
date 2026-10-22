import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { EDUCATION_OUTPUT } from "./output";

// The code block under `### education — CMD-EDUCATION` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### education — CMD-EDUCATION");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-EDUCATION");
  return match[1].replace(/\n$/, "");
}

describe("education output", () => {
  it("TC-CMD-EDUCATION-1: the output is exactly the PRD's block", () => {
    expect(EDUCATION_OUTPUT).toBe(prdBlock());
  });
});
