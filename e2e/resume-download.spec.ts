import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { BASE_PATH } from "../src/site";

// TC-CMD-RESUME-7: the real <a download> from the static export, which playwright.config.ts
// builds and serves under BASE_PATH (so the base path is checked for real).

test("TC-CMD-RESUME-7: `resume` downloads Han-Zeng-Resume.pdf from the base path and stays on the page", async ({
  page,
}) => {
  await page.goto("./");
  const pageUrl = page.url();
  const input = page.getByRole("textbox", { name: "Terminal input" });
  await input.fill("resume");

  const downloadPromise = page.waitForEvent("download");
  await input.press("Enter");
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("Han-Zeng-Resume.pdf");
  expect(new URL(download.url()).pathname).toBe(`${BASE_PATH}/resume.pdf`);
  const file = await readFile(await download.path());
  expect(file.subarray(0, 5).toString("latin1")).toBe("%PDF-");

  expect(page.url()).toBe(pageUrl);
  await expect(
    page.getByText("I am looking forward to hearing from you."),
  ).toBeVisible();
  await expect(page.getByText("(Come on! please! give me job.)")).toBeVisible();
});
