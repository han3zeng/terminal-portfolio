import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

import { NARROW_BANNER, TEXT_LINES, WIDE_BANNER } from "./art";

// Test hooks (cmd-welcome spec): welcome, welcome-description, welcome-banner-wide,
// welcome-banner-narrow. Stories render the real Terminal, whose first entry is `welcome`.
// The graphic is out of scope (Han implements it by hand), so nothing here checks it.

const VIEWPORTS = {
  w320: {
    name: "320px",
    styles: { width: "320px", height: "800px" },
    type: "mobile",
  },
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
  w767: {
    name: "767px",
    styles: { width: "767px", height: "900px" },
    type: "tablet",
  },
  w1280: {
    name: "1280px",
    styles: { width: "1280px", height: "800px" },
    type: "desktop",
  },
} as const;

const viewport = (value: keyof typeof VIEWPORTS) => ({
  viewport: { value, isRotated: false },
});

const meta = {
  title: "cmd-welcome/Welcome",
  render: () => <Terminal />,
  parameters: { layout: "fullscreen", viewport: { options: VIEWPORTS } },
  globals: viewport("w1280"),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DESCRIPTION_TEXT = `${WIDE_BANNER}\n\n\n${TEXT_LINES.join("\n")}`;

// ---------- helpers ----------

async function setup(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const input = (await canvas.findByRole("textbox", {
    name: "Terminal input",
  })) as HTMLInputElement;
  return { canvas, input };
}

type Canvas = ReturnType<typeof within>;

async function run(input: HTMLInputElement, text: string) {
  await userEvent.clear(input);
  if (text) await userEvent.type(input, text);
  await userEvent.keyboard("{Enter}");
}

const welcomes = (canvas: Canvas) => canvas.getAllByTestId("welcome");
const part = (root: HTMLElement, testId: string) =>
  within(root).getByTestId(testId);
const trimLines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");

// ---------- stories ----------

export const TC3: Story = {
  name: "TC-CMD-WELCOME-3: the first entry shows the desktop welcome, and `welcome` repeats it",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const [first] = welcomes(canvas);
    await expect(trimLines(part(first, "welcome-description").innerText)).toBe(
      DESCRIPTION_TEXT,
    );
    await expect(part(first, "welcome-banner-wide")).toBeVisible();
    await expect(part(first, "welcome-banner-narrow")).not.toBeVisible();

    await run(input, "welcome");
    const all = welcomes(canvas);
    await expect(all).toHaveLength(2);
    await expect(all[1].textContent).toBe(first.textContent);
  },
};

function narrowPlay(): Story["play"] {
  return async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    await expect(part(welcome, "welcome-banner-narrow")).toBeVisible();
    await expect(part(welcome, "welcome-banner-wide")).not.toBeVisible();
    const description = part(welcome, "welcome-description");
    await expect(description).toHaveTextContent(TEXT_LINES[0]);
    await expect(description).toHaveTextContent(TEXT_LINES[1]);
    await expect(
      trimLines(part(welcome, "welcome-banner-narrow").innerText),
    ).toBe(NARROW_BANNER);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  };
}

export const TC5At375: Story = {
  name: "TC-CMD-WELCOME-5: narrow screens show the narrow banner (375px)",
  globals: viewport("w375"),
  play: narrowPlay(),
};

export const TC5At767: Story = {
  name: "TC-CMD-WELCOME-5: narrow screens show the narrow banner (767px)",
  globals: viewport("w767"),
  play: narrowPlay(),
};

export const TC5At320: Story = {
  name: "TC-CMD-WELCOME-5: narrow screens show the narrow banner (320px)",
  globals: viewport("w320"),
  play: narrowPlay(),
};

export const TC6: Story = {
  name: "TC-CMD-WELCOME-6: the banner is primary; the text is fg",
  play: async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    await expect(
      getComputedStyle(part(welcome, "welcome-banner-wide")).color,
    ).toBe("rgb(143, 255, 224)");
    const text = within(part(welcome, "welcome-description")).getByText(
      TEXT_LINES[0],
      { exact: false },
    );
    await expect(getComputedStyle(text).color).toBe("rgb(211, 233, 230)");
  },
};

export const TC9At1280: Story = {
  name: "TC-CMD-WELCOME-9: the banner is one image named Han Zeng (1280px)",
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    const images = within(welcome).getAllByRole("img", { name: "Han Zeng" });
    await expect(images).toHaveLength(1);
    await expect(images[0]).toBe(part(welcome, "welcome-banner-wide"));
  },
};

export const TC9At375: Story = {
  name: "TC-CMD-WELCOME-9: the banner is one image named Han Zeng (375px)",
  globals: viewport("w375"),
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    const images = within(welcome).getAllByRole("img", { name: "Han Zeng" });
    await expect(images).toHaveLength(1);
    await expect(images[0]).toBe(part(welcome, "welcome-banner-narrow"));
  },
};
