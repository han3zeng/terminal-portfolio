import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

// Test hooks (cmd-education spec): education (output root).
// The expected text is the PRD's CMD-EDUCATION block, copied here because stories run in the browser.

const PRD_OUTPUT = `M.S. in Computer Science
Northwestern University | US | 2014 - 2015

B.E. in Electrical Engineering
National Chi Nan University | TW | 2009 - 2012`;

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

const meta = {
  title: "cmd-education/Education",
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

const text = (el: HTMLElement) =>
  el.innerText
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");

// ---------- stories ----------

export const TC2: Story = {
  name: "TC-CMD-EDUCATION-2: `education` prints the PRD's block in fg, every time",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "education");
    await run(input, "education");
    const all = canvas.getAllByTestId("education");
    await expect(all).toHaveLength(2);
    for (const output of all) {
      await expect(text(output)).toBe(PRD_OUTPUT);
      const style = getComputedStyle(output);
      await expect(style.color).toBe("rgb(211, 233, 230)");
      await expect(style.fontWeight).toBe("400");
    }
  },
};

export const TC3: Story = {
  name: "TC-CMD-EDUCATION-3: at 375px it is five rows without horizontal scroll",
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "education");
    const output = canvas.getByTestId("education");
    const rows = Math.round(
      output.getBoundingClientRect().height /
        parseFloat(getComputedStyle(output).lineHeight),
    );
    await expect(rows).toBe(5);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  },
};
