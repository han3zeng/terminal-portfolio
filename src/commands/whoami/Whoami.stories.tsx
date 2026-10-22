import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

// Test hooks (cmd-whoami spec): whoami (output root).
// The expected text is the PRD's CMD-WHOAMI block, copied here because stories run in the browser.

const PRD_OUTPUT = "A curious soul with root access to absolutely nothing";

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

const meta = {
  title: "cmd-whoami/Whoami",
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
  name: "TC-CMD-WHOAMI-2: `whoami` prints the PRD's line in fg, every time",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "whoami");
    await run(input, "whoami");
    const all = canvas.getAllByTestId("whoami");
    await expect(all).toHaveLength(2);
    for (const output of all) {
      await expect(output.innerText).toBe(PRD_OUTPUT);
      await expect(getComputedStyle(output).color).toBe("rgb(211, 233, 230)");
    }
  },
};

export const TC3: Story = {
  name: "TC-CMD-WHOAMI-3: at 375px there is no horizontal scroll",
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    await run(input, "whoami");
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  },
};
