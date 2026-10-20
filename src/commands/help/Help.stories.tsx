import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

// Test hooks (cmd-help spec): help (output root), help-heading (each section heading).
// The expected text is the PRD's CMD-HELP block, copied here because stories run in the browser.

const PRD_HELP = `These are all available commands in this terminal.

About me
- about: want to know more about me?
- education: my education background
- email: send an email to me
- projects: view all work that I have participated in
- resume: download my resume
- connect: check out my social accounts
- themes: check available themes
- welcome: display hero section

Utilities
- help: list all available commands

Typical terminal commands
- clear: clear the terminal
- history: view command history
- pwd: print current working directory
- whoami: people who want to be my friend`;

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
      "About me",
      "Utilities",
      "Typical terminal commands",
    ]);
    for (const heading of headings) {
      await expect(getComputedStyle(heading).color).toBe("rgb(143, 255, 224)");
    }
    const FG = "rgb(211, 233, 230)";
    await expect(
      getComputedStyle(
        help.getByText("These are all available commands in this terminal."),
      ).color,
    ).toBe(FG);
    await expect(
      getComputedStyle(help.getByText("- about: want to know more about me?"))
        .color,
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
    const projects = help
      .getByText("- projects: view all work that I have participated in")
      .getBoundingClientRect();
    const pwd = help
      .getByText("- pwd: print current working directory")
      .getBoundingClientRect();
    await expect(projects.height).toBeGreaterThan(pwd.height * 1.5);
  },
};
