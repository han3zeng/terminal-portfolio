import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";
import type { CommandEffects } from "@/terminal/types";

// Test hooks (cmd-connect spec): connect (output root), connect-usage-heading (the USAGE line),
// entry-output and terminal-entry (terminal-shell).
// The expected text is the PRD's CMD-CONNECT block, copied here because stories run in the browser.

const PRD_OUTPUT = `Let's connect!

  [1] Substack   https://substack.com/@han3zeng
  [2] GitHub     https://github.com/han3zeng
  [3] LinkedIn   https://www.linkedin.com/in/han3zeng

USAGE
  connect            list links
  connect go <n>     open link <n> in a new tab`;

const USAGE_OUTPUT = PRD_OUTPUT.split("\n").slice(-3).join("\n");

const URLS = [
  "https://substack.com/@han3zeng",
  "https://github.com/han3zeng",
  "https://www.linkedin.com/in/han3zeng",
];

const FG = "rgb(211, 233, 230)";
const PRIMARY = "rgb(143, 255, 224)";
const ACCENT = "rgb(84, 220, 192)";

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

type Args = { effects?: Partial<CommandEffects> };

const meta = {
  title: "cmd-connect/Connect",
  render: ({ effects }) => <Terminal effects={effects} />,
  parameters: { viewport: { options: VIEWPORTS } },
} satisfies Meta<Args>;

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
  name: "TC-CMD-CONNECT-4: `connect` prints exactly the PRD's text, every time",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "connect");
    await run(input, "connect");
    const all = canvas.getAllByTestId("connect");
    await expect(all).toHaveLength(2);
    for (const output of all) await expect(text(output)).toBe(PRD_OUTPUT);
  },
};

export const TC5: Story = {
  name: "TC-CMD-CONNECT-5: URLs are underlined accent links that open in a new tab",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "connect");
    const links = within(canvas.getByTestId("connect")).getAllByRole("link");
    await expect(links.map((l) => l.textContent)).toEqual(URLS);
    await expect(links.map((l) => l.getAttribute("href"))).toEqual(URLS);
    for (const link of links) {
      await expect(link).toHaveAccessibleName(link.getAttribute("href")!);
      await expect(link.getAttribute("target")).toBe("_blank");
      await expect(link.getAttribute("rel")).toContain("noopener");
      const style = getComputedStyle(link);
      await expect(style.color).toBe(ACCENT);
      await expect(style.textDecorationLine).toBe("underline");
    }
  },
};

export const TC6: Story = {
  name: "TC-CMD-CONNECT-6: USAGE is primary; the other lines are fg",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "connect");
    const output = within(canvas.getByTestId("connect"));
    const heading = output.getByTestId("connect-usage-heading");
    await expect(heading.textContent).toBe("USAGE");
    await expect(getComputedStyle(heading).color).toBe(PRIMARY);
    await expect(
      getComputedStyle(output.getByText("Let's connect!")).color,
    ).toBe(FG);
    await expect(
      getComputedStyle(output.getByText(/^\s*connect go <n>\s+open link/))
        .color,
    ).toBe(FG);
  },
};

export const TC7: Story = {
  name: "TC-CMD-CONNECT-7: `connect go <n>` opens the link once, at submit, and prints nothing",
  args: { effects: { openUrl: fn() } },
  play: async ({ args, canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const openUrl = args.effects!.openUrl!;

    await run(input, "connect go 2");
    await expect(openUrl).toHaveBeenCalledTimes(1);
    await expect(openUrl).toHaveBeenCalledWith("https://github.com/han3zeng");
    // The command's wrapper exists; it prints nothing.
    const output = within(lastEntry(canvas)).queryByTestId("entry-output");
    await expect(output?.innerText.trim() ?? "").toBe("");

    await run(input, "pwd");
    fireEvent.keyDown(input, { key: "l", ctrlKey: true });
    await run(input, "connect");
    await expect(openUrl).toHaveBeenCalledTimes(1);
  },
};

export const TC8: Story = {
  name: "TC-CMD-CONNECT-8: bad arguments print only the usage block and open nothing",
  args: { effects: { openUrl: fn() } },
  play: async ({ args, canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    for (const command of [
      "connect go 4",
      "connect go 01",
      "connect go 1 x",
      "connect foo",
    ]) {
      await run(input, command);
      const output = within(lastEntry(canvas)).getByTestId("entry-output");
      await expect({ command, text: text(output) }).toEqual({
        command,
        text: USAGE_OUTPUT,
      });
      await expect(within(output).queryAllByRole("link")).toHaveLength(0);
    }
    await expect(args.effects!.openUrl).not.toHaveBeenCalled();
  },
};

export const TC9: Story = {
  name: "TC-CMD-CONNECT-9: at 375px link rows wrap under the URL column, with no horizontal scroll",
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "connect");
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );

    const link = within(canvas.getByTestId("connect")).getByRole("link", {
      name: "https://www.linkedin.com/in/han3zeng",
    });
    const row = link.closest("li")!;
    const lineHeight = parseFloat(getComputedStyle(row).lineHeight);
    await expect(row.getBoundingClientRect().height).toBeGreaterThan(
      lineHeight * 1.5,
    );

    const rects = [...link.getClientRects()];
    await expect(rects.length).toBeGreaterThan(1);
    const first = rects[0].left;
    const last = rects[rects.length - 1].left;
    await expect(Math.abs(last - first)).toBeLessThanOrEqual(1);
  },
};
