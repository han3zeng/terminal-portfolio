import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

// Test hooks (cmd-help spec): help (output root), help-heading (each section heading).
// The expected text is the PRD's CMD-HELP block, copied here because stories run in the browser.

const PRD_HELP = `Available commands in this terminal

ABOUT ME
  about       Curious about me? Take a peek
  education   Where I earned my brainpower
  email       Shoot me an email
  projects    See what I've been cooking
  resume      My career highlights, minus all the embarrassing bits
  connect     Let's be internet friends
  themes      Change the vibe
  welcome     Back to square one

UTILITIES
  help        List all available commands

TERMINAL
  clear       Clear the terminal
  history     View command history
  pwd         Print current working directory
  whoami      A stranger, for now`;

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

const meta = {
  title: "cmd-help/Help",
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

type Canvas = ReturnType<typeof within>;

async function run(input: HTMLInputElement, text: string) {
  await userEvent.clear(input);
  if (text) await userEvent.type(input, text);
  await userEvent.keyboard("{Enter}");
}

const lastHelp = (canvas: Canvas) => {
  const all = canvas.getAllByTestId("help");
  return all[all.length - 1];
};

const text = (el: HTMLElement) =>
  el.innerText
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");

// ---------- stories ----------

export const TC3: Story = {
  name: "TC-CMD-HELP-3: `help` prints exactly the PRD's text, every time",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "help");
    await expect(text(lastHelp(canvas))).toBe(PRD_HELP);
    await run(input, "help");
    const all = canvas.getAllByTestId("help");
    await expect(all).toHaveLength(2);
    await expect(text(all[1])).toBe(text(all[0]));
  },
};

export const TC4: Story = {
  name: "TC-CMD-HELP-4: headings are primary, lines are fg, and each section is a list",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "help");
    const help = within(lastHelp(canvas));

    const headings = help.getAllByTestId("help-heading");
    await expect(headings.map((h) => h.textContent)).toEqual([
      "ABOUT ME",
      "UTILITIES",
      "TERMINAL",
    ]);
    for (const heading of headings) {
      await expect(getComputedStyle(heading).color).toBe("rgb(143, 255, 224)");
    }
    const FG = "rgb(211, 233, 230)";
    await expect(
      getComputedStyle(help.getByText("Available commands in this terminal"))
        .color,
    ).toBe(FG);
    await expect(
      getComputedStyle(help.getByText(/^\s*about\s+Curious about me\?/)).color,
    ).toBe(FG);

    const lists = help.getAllByRole("list");
    await expect(
      lists.map((list) => within(list).getAllByRole("listitem").length),
    ).toEqual([8, 1, 4]);
  },
};

export const TC5: Story = {
  name: "TC-CMD-HELP-5: at 375px long lines wrap without horizontal scroll",
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "help");
    const help = within(lastHelp(canvas));
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
    const resume = help
      .getByText(/^\s*resume\s+My career highlights/)
      .getBoundingClientRect();
    const email = help
      .getByText(/^\s*email\s+Shoot me an email/)
      .getBoundingClientRect();
    await expect(resume.height).toBeGreaterThan(email.height * 1.5);
  },
};
