import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { emailText } from "./email";

// The code block under `### email — CMD-EMAIL` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### email — CMD-EMAIL");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-EMAIL");
  return match[1].replace(/\n$/, "");
}

describe("email output", () => {
  it("TC-CMD-EMAIL-1: the plain-text rendering is exactly the PRD's block", () => {
    expect(emailText()).toBe(prdBlock());
  });
});
