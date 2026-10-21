import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { WHOAMI_OUTPUT } from "./output";

// The code block under `### whoami — CMD-WHOAMI` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### whoami — CMD-WHOAMI");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-WHOAMI");
  return match[1].replace(/\n$/, "");
}

describe("whoami output", () => {
  it("TC-CMD-WHOAMI-1: the output is exactly the PRD's block", () => {
    expect(WHOAMI_OUTPUT).toBe(prdBlock());
  });
});
