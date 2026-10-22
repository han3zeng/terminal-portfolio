import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

// Test hooks (cmd-about spec): about (output root).
// The expected text is the PRD's CMD-ABOUT block, copied here because stories run in the browser.

const PRD_OUTPUT = `Hi! I am Han from Taiwan, a front-end engineer with an insatiable curiosity.
I love to make impacts through coding.`;

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

const meta = {
  title: "cmd-about/About",
  render: () => <Terminal />,
  parameters: { viewport: { options: VIEWPORTS } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

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

// ---------- stories ----------

export const TC2: Story = {
  name: "TC-CMD-ABOUT-2: `about` prints the PRD's two lines in fg, every time",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "about");
    await run(input, "about");
    const all = canvas.getAllByTestId("about");
    await expect(all).toHaveLength(2);
    for (const output of all) {
      await expect(output.innerText).toBe(PRD_OUTPUT);
      await expect(getComputedStyle(output).color).toBe("rgb(211, 233, 230)");
      await expect(output.querySelector("a")).toBeNull();
    }
  },
};

export const TC3: Story = {
  name: "TC-CMD-ABOUT-3: at 375px the first line wraps without horizontal scroll",
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "about");
    const output = canvas.getByTestId("about");
    await expect(output.textContent).toBe(PRD_OUTPUT);
    const rows = Math.round(
      output.getBoundingClientRect().height /
        parseFloat(getComputedStyle(output).lineHeight),
    );
    await expect(rows).toBeGreaterThan(2);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  },
};
