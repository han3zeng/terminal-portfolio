// spec:status — for each TC-* ID in docs/features/*/spec.md, report whether it is
// missing (no test name starts with the ID), failing, or passing.
//
//   pnpm spec:status                   all features
//   pnpm spec:status terminal-shell    one feature
//   pnpm spec:status --report <file>   reuse an existing Vitest JSON report instead of running tests
//   pnpm spec:status --e2e-report <file>  reuse an existing Playwright JSON report (with --report;
//                                         without it, --report alone skips the e2e tests)
//   pnpm spec:status --features <dir>  read specs from <dir>/*/spec.md (used by the script's own tests)
//
// Exits 0 only if every reported ID is passing and no test uses an unknown ID.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const ID = /\bTC-[A-Z][A-Z0-9-]*-\d+\b/g;

// ---------- args ----------

const args = process.argv.slice(2);
function takeOption(name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const [, value] = args.splice(i, 2);
  return value;
}
let reportPath = takeOption("--report");
let e2eReportPath = takeOption("--e2e-report");
const featuresDir = path.resolve(
  takeOption("--features") ?? path.join(root, "docs/features"),
);
const onlyFeature = args[0];

// ---------- spec IDs ----------

const features = readdirSync(featuresDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => existsSync(path.join(featuresDir, name, "spec.md")))
  .sort();

if (onlyFeature && !features.includes(onlyFeature)) {
  console.error(
    `No spec found: ${path.relative(root, path.join(featuresDir, onlyFeature, "spec.md"))}`,
  );
  console.error(`Features with a spec: ${features.join(", ") || "(none)"}`);
  process.exit(2);
}

// Only IDs with this feature's own prefix count, so a spec may mention other features' IDs.
const specIds = new Map(); // feature -> ordered unique IDs
for (const feature of features) {
  const prefix = `TC-${feature.toUpperCase()}-`;
  const text = readFileSync(path.join(featuresDir, feature, "spec.md"), "utf8");
  const ids = [...new Set(text.match(ID) ?? [])].filter(
    (id) => id.startsWith(prefix) && /^\d+$/.test(id.slice(prefix.length)),
  );
  const num = (id) => Number(id.slice(prefix.length));
  specIds.set(
    feature,
    ids.sort((a, b) => num(a) - num(b)),
  );
}
const allSpecIds = new Set([...specIds.values()].flat());

// ---------- test results ----------

if (!reportPath) {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-status-"));
  reportPath = path.join(dir, "report.json");
  e2eReportPath = path.join(dir, "e2e-report.json");
  const run = spawnSync(
    "pnpm",
    ["exec", "vitest", "run", "--reporter=json", `--outputFile=${reportPath}`],
    { cwd: root, stdio: ["ignore", "ignore", "pipe"], encoding: "utf8" },
  );
  // Vitest exits non-zero when tests fail; that is expected. A missing report is not.
  if (!existsSync(reportPath)) {
    console.error("Vitest did not write a report. Its output:\n");
    console.error(run.stderr);
    process.exit(2);
  }
  const e2e = spawnSync(
    "pnpm",
    ["exec", "playwright", "test", "--reporter=json"],
    {
      cwd: root,
      stdio: ["ignore", "ignore", "pipe"],
      encoding: "utf8",
      env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: e2eReportPath },
    },
  );
  if (!existsSync(e2eReportPath)) {
    console.error("Playwright did not write a report. Its output:\n");
    console.error(e2e.stderr);
    process.exit(2);
  }
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
const tests = report.testResults.flatMap((file) =>
  file.assertionResults.map((t) => ({ title: t.title, status: t.status })),
);
// A run-level error (e.g. the browser crashed) can leave tests unreported.
const runErrors = report.testResults
  .filter((f) => f.status === "failed" && f.message)
  .map((f) => path.relative(root, f.name));

// Playwright's report nests suites; each spec has one test per project.
if (e2eReportPath) {
  const e2eReport = JSON.parse(readFileSync(e2eReportPath, "utf8"));
  const collect = (suite) => {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests) {
        const status =
          t.status === "skipped"
            ? "skipped"
            : t.status === "expected"
              ? "passed"
              : "failed";
        tests.push({ title: spec.title, status });
      }
    }
    for (const child of suite.suites ?? []) collect(child);
  };
  for (const suite of e2eReport.suites ?? []) collect(suite);
  // e.g. the web server failed to start, so no test ran.
  for (const error of e2eReport.errors ?? []) {
    runErrors.push(`playwright: ${error.message?.split("\n")[0] ?? "error"}`);
  }
}

// The ID is everything before the first ":" in the test name.
const byId = new Map();
for (const test of tests) {
  const match = /^(TC-[A-Z][A-Z0-9-]*-\d+):/.exec(test.title);
  if (!match) continue;
  if (!byId.has(match[1])) byId.set(match[1], []);
  byId.get(match[1]).push(test);
}

// ---------- report ----------

let ok = true;
const totals = { passing: 0, failing: 0, missing: 0 };

for (const [feature, ids] of specIds) {
  if (onlyFeature && feature !== onlyFeature) continue;
  console.log(`\n${feature}`);
  if (ids.length === 0) console.log("  (no TC IDs in spec)");
  const width = Math.max(0, ...ids.map((id) => id.length));

  for (const id of ids) {
    const found = byId.get(id) ?? [];
    const notPassed = found.filter((t) => t.status !== "passed");
    let state;
    let note = "";
    if (found.length === 0) state = "missing";
    else if (notPassed.length > 0) {
      state = "failing";
      const skipped = notPassed.filter((t) => t.status !== "failed").length;
      note = `${notPassed.length} of ${found.length} not passing${skipped ? `, ${skipped} skipped` : ""}`;
    } else {
      state = "passing";
      if (found.length > 1) note = `${found.length} tests`;
    }
    totals[state]++;
    if (state !== "passing") ok = false;
    console.log(
      `  ${id.padEnd(width)}  ${state.padEnd(7)}${note ? `  (${note})` : ""}`,
    );
  }
}

// Test names whose ID is in no spec: usually a typo or a renumbered ID.
// Always reported, even with a feature filter, since a typo can break the prefix too.
const unknown = [...byId.keys()].filter((id) => !allSpecIds.has(id));
if (unknown.length > 0) {
  ok = false;
  console.log("\nTests with an ID that is in no spec:");
  for (const id of unknown) console.log(`  ${id}`);
}

if (runErrors.length > 0) {
  ok = false;
  console.log("\nTest files that failed to run:");
  for (const f of runErrors) console.log(`  ${f}`);
}

const total = totals.passing + totals.failing + totals.missing;
console.log(
  `\n${total} IDs: ${totals.passing} passing, ${totals.failing} failing, ${totals.missing} missing`,
);
process.exit(ok ? 0 : 1);
