import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PWD_OUTPUT } from "./output";

// The code block under `### pwd — CMD-PWD` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### pwd — CMD-PWD");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-PWD");
  return match[1].replace(/\n$/, "");
}

describe("pwd output", () => {
  it("TC-CMD-PWD-1: the output is exactly the PRD's block", () => {
    expect(PWD_OUTPUT).toBe(prdBlock());
  });
});
