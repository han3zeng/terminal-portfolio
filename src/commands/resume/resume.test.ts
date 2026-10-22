import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { BASE_PATH } from "@/site";

import { RESUME_FILENAME, RESUME_URL, resumeText } from "./resume";

const root = path.resolve(import.meta.dirname, "../../..");

// The code block under `### resume — CMD-RESUME` in the PRD.
function prdBlock(): string {
  const prd = readFileSync(
    path.join(root, "docs/product-requirements.md"),
    "utf8",
  );
  const start = prd.indexOf("### resume — CMD-RESUME");
  const end = prd.indexOf("\n### ", start + 1);
  const match = prd.slice(start, end).match(/```\n([\s\S]*?)```/);
  if (!match) throw new Error("no code block under CMD-RESUME");
  return match[1].replace(/\n$/, "");
}

describe("resume", () => {
  it("TC-CMD-RESUME-1: the plain-text rendering is exactly the PRD's block", () => {
    expect(resumeText()).toBe(prdBlock());
  });

  it("TC-CMD-RESUME-2: the URL includes the base path; the file is saved as Han-Zeng-Resume.pdf", () => {
    expect(RESUME_URL).toBe(`${BASE_PATH}/resume.pdf`);
    expect(RESUME_FILENAME).toBe("Han-Zeng-Resume.pdf");
  });

  it("TC-CMD-RESUME-3: public/resume.pdf is a PDF", () => {
    const pdf = readFileSync(path.join(root, "public/resume.pdf"));
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
