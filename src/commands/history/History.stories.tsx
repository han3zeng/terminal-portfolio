import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

// Test hooks (cmd-history spec): history (output root).
// Items are compared by textContent, so leading and trailing spaces count.

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

const meta = {
  title: "cmd-history/History",
  render: () => <Terminal />,
  parameters: { viewport: { options: VIEWPORTS } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- helpers ----------

type Canvas = ReturnType<typeof within>;

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

const items = (output: HTMLElement) =>
  within(output)
    .getAllByRole("listitem")
    .map((li) => li.textContent);

const outputs = (canvas: Canvas) => canvas.getAllByTestId("history");

// ---------- stories ----------

export const TC1: Story = {
  name: "TC-CMD-HISTORY-1: on a fresh page `history` lists `welcome` and itself, in fg",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "history");
    const output = canvas.getByTestId("history");
    await expect(output).toHaveRole("list");
    await expect(items(output)).toEqual(["welcome", "history"]);
    for (const li of within(output).getAllByRole("listitem")) {
      await expect(getComputedStyle(li).color).toBe("rgb(211, 233, 230)");
    }
  },
};

export const TC2: Story = {
  name: "TC-CMD-HISTORY-2: every non-empty input is listed exactly as typed, duplicates kept",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    for (const t of [
      "about",
      "foo",
      "about x",
      "   ",
      "  pwd  ",
      "pwd",
      "pwd",
      "history",
    ]) {
      await run(input, t);
    }
    await expect(items(canvas.getByTestId("history"))).toEqual([
      "welcome",
      "about",
      "foo",
      "about x",
      "  pwd  ",
      "pwd",
      "pwd",
      "history",
    ]);
  },
};

export const TC3: Story = {
  name: "TC-CMD-HISTORY-3: `clear` keeps history; Ctrl+L is not recorded",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "pwd");
    await run(input, "clear");
    await userEvent.clear(input);
    fireEvent.keyDown(input, { key: "l", ctrlKey: true });
    await run(input, "history");
    await expect(items(canvas.getByTestId("history"))).toEqual([
      "welcome",
      "pwd",
      "clear",
      "history",
    ]);
  },
};

export const TC4: Story = {
  name: "TC-CMD-HISTORY-4: an earlier `history` output does not change later",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "history");
    await run(input, "pwd");
    await run(input, "history");
    const [first, second] = outputs(canvas);
    await expect(items(first)).toEqual(["welcome", "history"]);
    await expect(items(second)).toEqual([
      "welcome",
      "history",
      "pwd",
      "history",
    ]);
  },
};

export const TC5: Story = {
  name: "TC-CMD-HISTORY-5: at 375px there is no horizontal scroll",
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    // A long input with no spaces is the widest thing `history` can print.
    await run(input, "x".repeat(200));
    await run(input, "history");
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  },
};
