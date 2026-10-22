import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PROJECTS, projectsText } from "./projects";

// The code block under `### projects — CMD-PROJECTS` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### projects — CMD-PROJECTS");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-PROJECTS");
  return match[1].replace(/\n$/, "");
}

describe("projects output", () => {
  it("TC-CMD-PROJECTS-1: the plain-text rendering is exactly the PRD's block", () => {
    expect(projectsText(PROJECTS)).toBe(prdBlock());
  });
});
