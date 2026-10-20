import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { commands } from "@/terminal/commands";

import { HELP_INTRO, HELP_SECTIONS } from "./helpText";

// The code block under `### help — CMD-HELP` in the PRD.
function prdHelpBlock(): string {
  const prd = readFileSync(
    path.resolve(import.meta.dirname, "../../../docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### help — CMD-HELP");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-HELP");
  return match[1].replace(/\n$/, "");
}

const renderText = () =>
  [
    HELP_INTRO,
    ...HELP_SECTIONS.map((section) =>
      [
        section.heading,
        ...section.lines.map((l) => `- ${l.name}: ${l.description}`),
      ].join("\n"),
    ),
  ].join("\n\n");

describe("help text", () => {
  it("TC-CMD-HELP-1: the intro and sections render to exactly the PRD's block", () => {
    expect(renderText()).toBe(prdHelpBlock());
  });

  it("TC-CMD-HELP-2: help lists every registered command exactly once, and nothing else", () => {
    const names = HELP_SECTIONS.flatMap((s) => s.lines.map((l) => l.name));
    expect(names).toHaveLength(new Set(names).size);
    expect([...names].sort()).toEqual(commands.map((c) => c.name).sort());
  });
});
