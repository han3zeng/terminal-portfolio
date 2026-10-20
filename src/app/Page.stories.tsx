import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import Home from "./page";

// The real page (page.tsx) with globals.css, for the layout spec's page-shell tests.
// Stories never see layout.tsx's <html>/<body>, so these tests check what globals.css provides.
//
// Page-wide checks look at <html>, <body> and the story root only: Storybook keeps its own
// hidden UI (loaders, error display) in <body>, and that UI has rounded corners.

const VIEWPORTS = {
  w320: {
    name: "320px",
    styles: { width: "320px", height: "640px" },
    type: "mobile",
  },
  w375: {
    name: "375px",
    styles: { width: "375px", height: "667px" },
    type: "mobile",
  },
  w1280x400: {
    name: "1280×400",
    styles: { width: "1280px", height: "400px" },
    type: "desktop",
  },
  w1280x800: {
    name: "1280×800",
    styles: { width: "1280px", height: "800px" },
    type: "desktop",
  },
} as const;

const viewport = (value: keyof typeof VIEWPORTS) => ({
  viewport: { value, isRotated: false },
});

const meta = {
  title: "layout/Page",
  component: Home,
  parameters: { layout: "fullscreen", viewport: { options: VIEWPORTS } },
  globals: viewport("w1280x800"),
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

const TITLE = "Han Zeng — Terminal Portfolio";
const BG = "rgb(9, 19, 33)"; // #091321
const FG = "rgb(211, 233, 230)"; // #D3E9E6

// ---------- helpers ----------

async function setup(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const input = (await canvas.findByRole("textbox", {
    name: "Terminal input",
  })) as HTMLInputElement;
  return { canvas, input };
}

async function run(input: HTMLInputElement, text: string) {
  await userEvent.clear(input);
  if (text) await userEvent.type(input, text);
  await userEvent.keyboard("{Enter}");
}

// <html>, <body>, the story root and everything inside it.
const pageElements = (canvasElement: HTMLElement): Element[] => [
  document.documentElement,
  document.body,
  canvasElement,
  ...Array.from(canvasElement.querySelectorAll("*")),
];

const describe = (el: Element) =>
  `${el.tagName.toLowerCase()}${el.getAttribute("data-testid") ? `[data-testid=${el.getAttribute("data-testid")}]` : ""}`;

const startsWithJetBrainsMono = (el: Element) =>
  /^"?JetBrains Mono"?(,|$)/.test(getComputedStyle(el).fontFamily);

// ---------- stories ----------

export const TC5: Story = {
  name: "TC-LAYOUT-5: the dark bg fills the screen, with fg text and no frame",
  play: async ({ canvasElement }) => {
    await setup(canvasElement);
    await expect(
      getComputedStyle(document.documentElement).backgroundColor,
    ).toBe(BG);
    await expect(getComputedStyle(document.body).backgroundColor).toBe(BG);
    await expect(getComputedStyle(document.body).color).toBe(FG);
    await expect(
      document.body.getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(window.innerHeight);

    const bordered = pageElements(canvasElement)
      .filter((el) => {
        const s = getComputedStyle(el);
        return [
          s.borderTopWidth,
          s.borderRightWidth,
          s.borderBottomWidth,
          s.borderLeftWidth,
        ].some((w) => parseFloat(w) > 0);
      })
      .map(describe);
    await expect(bordered).toEqual([]);
  },
};

export const TC6: Story = {
  name: "TC-LAYOUT-6: JetBrains Mono at 16px with a 24px line height everywhere",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "nope"); // `command not found: nope` gives an entry with output
    await document.fonts.ready;

    const body = getComputedStyle(document.body);
    await expect(body.fontSize).toBe("16px");
    await expect(body.lineHeight).toBe("24px");

    const entries = canvas.getAllByTestId("terminal-entry");
    const last = within(entries[entries.length - 1]);
    for (const el of [
      document.body,
      input,
      last.getByTestId("prompt"),
      last.getByTestId("entry-output"),
    ]) {
      await expect({
        el: describe(el),
        jetBrainsMono: startsWithJetBrainsMono(el),
      }).toEqual({ el: describe(el), jetBrainsMono: true });
    }
    await expect(document.fonts.check('16px "JetBrains Mono"')).toBe(true);
  },
};

export const TC7: Story = {
  name: "TC-LAYOUT-7: square corners, no shadows, no background images",
  play: async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    await run(input, "help");
    await run(input, "nope");

    const decorated = pageElements(canvasElement)
      .filter((el) => {
        const s = getComputedStyle(el);
        return (
          s.borderTopLeftRadius !== "0px" ||
          s.borderTopRightRadius !== "0px" ||
          s.borderBottomRightRadius !== "0px" ||
          s.borderBottomLeftRadius !== "0px" ||
          s.boxShadow !== "none" ||
          s.backgroundImage !== "none"
        );
      })
      .map(describe);
    await expect(decorated).toEqual([]);
  },
};

export const TC8: Story = {
  name: "TC-LAYOUT-8: the whole page scrolls, with no inner scroll container",
  globals: viewport("w1280x400"),
  play: async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    for (let i = 0; i < 30; i++) await run(input, "nope");

    await expect(document.documentElement.scrollHeight).toBeGreaterThan(
      window.innerHeight,
    );
    const innerScrollers = pageElements(canvasElement)
      .filter((el) => el !== document.documentElement && el !== document.body)
      .filter((el) => {
        const overflowY = getComputedStyle(el).overflowY;
        return (
          (overflowY === "auto" || overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight
        );
      })
      .map(describe);
    await expect(innerScrollers).toEqual([]);
    await waitFor(() => {
      const box = input.getBoundingClientRect();
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
    });
  },
};

function noHorizontalScrollPlay(): Story["play"] {
  return async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
    await run(input, "x".repeat(200));
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  };
}

export const TC9At375: Story = {
  name: "TC-LAYOUT-9: no horizontal page scroll (375px)",
  globals: viewport("w375"),
  play: noHorizontalScrollPlay(),
};

export const TC9At320: Story = {
  name: "TC-LAYOUT-9: no horizontal page scroll (320px)",
  globals: viewport("w320"),
  play: noHorizontalScrollPlay(),
};

export const TC10: Story = {
  name: "TC-LAYOUT-10: one visually hidden h1 with the title, inside main; no a11y violations",
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const headings = canvas.queryAllByRole("heading", { level: 1 });
    await expect(headings).toHaveLength(1);
    const h1 = headings[0];
    await expect(h1).toHaveAccessibleName(TITLE);
    await expect(h1.closest("main")).not.toBeNull();
    const box = h1.getBoundingClientRect();
    await expect(box.width).toBeLessThanOrEqual(1);
    await expect(box.height).toBeLessThanOrEqual(1);
  },
};
