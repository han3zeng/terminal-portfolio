import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

// Runs the real script against fixture specs and hand-made Vitest and Playwright JSON
// reports, so these tests never run Vitest or Playwright recursively.

const SCRIPT = path.join(import.meta.dirname, "spec-status.mjs");

type Status = "passed" | "failed" | "skipped";
type Fixture = {
  specs: Record<string, string>; // feature slug -> spec.md content
  tests: [title: string, status: Status][];
  // A test file that failed to run (e.g. the browser crashed).
  brokenFile?: string;
  // A Playwright report: test titles with Playwright's statuses, and run-level errors.
  e2e?: {
    tests: [title: string, status: "expected" | "unexpected" | "skipped"][];
    errors?: string[];
  };
  args?: string[];
};

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

function runStatus({ specs, tests, brokenFile, e2e, args = [] }: Fixture) {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-status-test-"));
  dirs.push(dir);

  const featuresDir = path.join(dir, "features");
  for (const [feature, content] of Object.entries(specs)) {
    mkdirSync(path.join(featuresDir, feature), { recursive: true });
    writeFileSync(path.join(featuresDir, feature, "spec.md"), content);
  }

  const testResults = [
    {
      name: path.join(dir, "a.test.ts"),
      status: tests.some(([, s]) => s === "failed") ? "failed" : "passed",
      message: "",
      assertionResults: tests.map(([title, status]) => ({ title, status })),
    },
  ];
  if (brokenFile) {
    testResults.push({
      name: path.join(dir, brokenFile),
      status: "failed",
      message: "Browser connection was closed",
      assertionResults: [],
    });
  }
  const reportPath = path.join(dir, "report.json");
  writeFileSync(reportPath, JSON.stringify({ testResults }));

  const e2eArgs: string[] = [];
  if (e2e) {
    const e2ePath = path.join(dir, "e2e-report.json");
    writeFileSync(
      e2ePath,
      JSON.stringify({
        suites: [
          {
            title: "a.spec.ts",
            specs: [],
            suites: [
              {
                title: "describe",
                specs: e2e.tests.map(([title, status]) => ({
                  title,
                  tests: [{ status }],
                })),
              },
            ],
          },
        ],
        errors: (e2e.errors ?? []).map((message) => ({ message })),
      }),
    );
    e2eArgs.push("--e2e-report", e2ePath);
  }

  const result = spawnSync(
    process.execPath,
    [
      SCRIPT,
      ...args,
      "--features",
      featuresDir,
      "--report",
      reportPath,
      ...e2eArgs,
    ],
    { encoding: "utf8" },
  );
  return { code: result.status, out: result.stdout, err: result.stderr };
}

// The state printed for one ID, e.g. "passing".
function stateOf(out: string, id: string) {
  return new RegExp(`^\\s+${id}\\s+(\\w+)`, "m").exec(out)?.[1];
}

const FOO_SPEC = `# foo

## Test cases

- **TC-FOO-1** (Vitest) [X-1] Given … then …
- **TC-FOO-2** (Storybook) [X-2] Given … then …
`;

describe("spec:status", () => {
  it("all passing: every ID has a passing test, exit 0", () => {
    const { code, out } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [
        ["TC-FOO-1: parses input", "passed"],
        ["TC-FOO-2: renders output", "passed"],
      ],
    });
    expect(stateOf(out, "TC-FOO-1")).toBe("passing");
    expect(stateOf(out, "TC-FOO-2")).toBe("passing");
    expect(out).toContain("2 IDs: 2 passing, 0 failing, 0 missing");
    expect(code).toBe(0);
  });

  it("missing: a spec ID with no test is reported, exit 1", () => {
    const { code, out } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [["TC-FOO-1: parses input", "passed"]],
    });
    expect(stateOf(out, "TC-FOO-1")).toBe("passing");
    expect(stateOf(out, "TC-FOO-2")).toBe("missing");
    expect(out).toContain("2 IDs: 1 passing, 0 failing, 1 missing");
    expect(code).toBe(1);
  });

  it("failing: a failed or skipped test makes its ID failing, exit 1", () => {
    const { code, out } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [
        ["TC-FOO-1: parses input", "failed"],
        ["TC-FOO-2: at 375px", "passed"],
        ["TC-FOO-2: at 1024px", "skipped"],
      ],
    });
    expect(stateOf(out, "TC-FOO-1")).toBe("failing");
    expect(stateOf(out, "TC-FOO-2")).toBe("failing");
    expect(out).toContain("1 of 2 not passing, 1 skipped");
    expect(code).toBe(1);
  });

  it("several tests for one ID: passing only when all of them pass", () => {
    const { code, out } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [
        ["TC-FOO-1: a", "passed"],
        ["TC-FOO-2: at 375px", "passed"],
        ["TC-FOO-2: at 1024px", "passed"],
      ],
    });
    expect(stateOf(out, "TC-FOO-2")).toBe("passing");
    expect(out).toContain("(2 tests)");
    expect(code).toBe(0);
  });

  it("IDs match exactly: TC-FOO-1 is not satisfied by a TC-FOO-10 test", () => {
    const { out } = runStatus({
      specs: { foo: `- **TC-FOO-1** …\n- **TC-FOO-10** …\n- **TC-FOO-2** …` },
      tests: [
        ["TC-FOO-10: ten", "passed"],
        ["TC-FOO-2: two", "passed"],
      ],
    });
    expect(stateOf(out, "TC-FOO-1")).toBe("missing");
    expect(stateOf(out, "TC-FOO-10")).toBe("passing");
    // Listed in numeric order, not order of appearance.
    expect(out.indexOf("TC-FOO-2 ")).toBeLessThan(out.indexOf("TC-FOO-10"));
  });

  it("unknown IDs: tests whose ID is in no spec (typos) fail the run, even with a feature filter", () => {
    const { code, out } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [
        ["TC-FOO-1: a", "passed"],
        ["TC-FOO-2: b", "passed"],
        ["TC-FO-3: typo", "passed"],
        ["TC-FOO-99: not in spec", "passed"],
      ],
      args: ["foo"],
    });
    expect(out).toContain("Tests with an ID that is in no spec:");
    expect(out).toContain("TC-FO-3");
    expect(out).toContain("TC-FOO-99");
    expect(code).toBe(1);
  });

  it("feature filter: only that feature's IDs are reported; other features' IDs in a spec are ignored", () => {
    const { code, out } = runStatus({
      specs: {
        foo: `${FOO_SPEC}\nSee also TC-BAR-1.`,
        bar: "- **TC-BAR-1** …",
      },
      tests: [
        ["TC-FOO-1: a", "passed"],
        ["TC-FOO-2: b", "passed"],
      ],
      args: ["foo"],
    });
    expect(out).toContain("\nfoo\n");
    expect(out).not.toContain("\nbar\n");
    expect(stateOf(out, "TC-BAR-1")).toBeUndefined();
    expect(out).toContain("2 IDs: 2 passing");
    expect(code).toBe(0);
  });

  it("unknown feature: exits 2 and lists the features that have a spec", () => {
    const { code, err } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [],
      args: ["nope"],
    });
    expect(err).toContain("No spec found");
    expect(err).toContain("Features with a spec: foo");
    expect(code).toBe(2);
  });

  it("broken test file: a file that failed to run is reported, exit 1", () => {
    const { code, out } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [
        ["TC-FOO-1: a", "passed"],
        ["TC-FOO-2: b", "passed"],
      ],
      brokenFile: "Broken.stories.tsx",
    });
    expect(out).toContain("Test files that failed to run:");
    expect(out).toContain("Broken.stories.tsx");
    expect(code).toBe(1);
  });

  it("e2e report: Playwright tests count, in nested suites; unexpected or skipped is failing", () => {
    const passing = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [["TC-FOO-1: a", "passed"]],
      e2e: { tests: [["TC-FOO-2: first paint", "expected"]] },
    });
    expect(stateOf(passing.out, "TC-FOO-2")).toBe("passing");
    expect(passing.code).toBe(0);

    const failing = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [["TC-FOO-1: a", "passed"]],
      e2e: {
        tests: [
          ["TC-FOO-2: light", "expected"],
          ["TC-FOO-2: dark", "unexpected"],
          ["TC-FOO-2: matrix", "skipped"],
        ],
      },
    });
    expect(stateOf(failing.out, "TC-FOO-2")).toBe("failing");
    expect(failing.out).toContain("2 of 3 not passing, 1 skipped");
    expect(failing.code).toBe(1);
  });

  it("e2e report: a run-level Playwright error (e.g. the web server failed) is reported, exit 1", () => {
    const { code, out } = runStatus({
      specs: { foo: FOO_SPEC },
      tests: [
        ["TC-FOO-1: a", "passed"],
        ["TC-FOO-2: b", "passed"],
      ],
      e2e: {
        tests: [],
        errors: ["Error: Process from config.webServer exited early.\nmore"],
      },
    });
    expect(out).toContain("Test files that failed to run:");
    expect(out).toContain(
      "playwright: Error: Process from config.webServer exited early.",
    );
    expect(code).toBe(1);
  });
});
