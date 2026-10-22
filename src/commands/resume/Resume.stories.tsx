import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { BASE_PATH } from "@/site";
import { Terminal } from "@/terminal/Terminal";
import type { CommandEffects } from "@/terminal/types";

// Test hooks (cmd-resume spec): resume (output root), entry-output and terminal-entry (terminal-shell).
// The expected text is the PRD's CMD-RESUME block, copied here because stories run in the browser.
// Every story passes a download spy: the real default would download a file from the iframe.

const PRD_OUTPUT = `I am looking forward to hearing from you.
(Come on! please! give me job.)`;

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

type Args = { effects?: Partial<CommandEffects> };

const meta = {
  title: "cmd-resume/Resume",
  render: ({ effects }) => <Terminal effects={effects} />,
  parameters: { viewport: { options: VIEWPORTS } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- helpers ----------

const spyArgs = () => ({ effects: { download: fn() } });

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

const text = (el: HTMLElement) =>
  el.innerText
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");

const lastEntry = (canvas: Canvas) => {
  const all = canvas.getAllByTestId("terminal-entry");
  return all[all.length - 1];
};

// ---------- stories ----------

export const TC4: Story = {
  name: "TC-CMD-RESUME-4: `resume` prints exactly the PRD's text, every time, with no links",
  args: spyArgs(),
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "resume");
    await run(input, "resume");
    const all = canvas.getAllByTestId("resume");
    await expect(all).toHaveLength(2);
    for (const output of all) {
      await expect(text(output)).toBe(PRD_OUTPUT);
      await expect(within(output).queryAllByRole("link")).toHaveLength(0);
    }
  },
};

export const TC5: Story = {
  name: "TC-CMD-RESUME-5: the download starts once, at submit; `resume foo` is usage",
  args: spyArgs(),
  play: async ({ args, canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const download = args.effects!.download!;

    await run(input, "resume");
    await expect(download).toHaveBeenCalledTimes(1);
    await expect(download).toHaveBeenCalledWith(
      `${BASE_PATH}/resume.pdf`,
      "Han-Zeng-Resume.pdf",
    );

    await run(input, "pwd");
    fireEvent.keyDown(input, { key: "l", ctrlKey: true });
    await run(input, "help");
    await expect(download).toHaveBeenCalledTimes(1);

    await run(input, "resume foo");
    await expect(
      within(lastEntry(canvas)).getByTestId("entry-output").textContent,
    ).toBe("Usage: resume");
    await expect(download).toHaveBeenCalledTimes(1);
  },
};

export const TC6: Story = {
  name: "TC-CMD-RESUME-6: at 375px there is no horizontal scroll",
  args: spyArgs(),
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "resume");
    await expect(canvas.getByTestId("resume")).toBeVisible();
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  },
};
