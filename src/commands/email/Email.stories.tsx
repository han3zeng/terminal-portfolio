import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";
import type { CommandEffects } from "@/terminal/types";

// Test hooks (cmd-email spec): email (output root), entry-output and terminal-entry (terminal-shell).
// The expected text is the PRD's CMD-EMAIL block, copied here because stories run in the browser.
// Every story passes a navigate spy: the real default would send the iframe to mailto:.

const PRD_OUTPUT = `My favorite quote from the show How I Met Your Mother
Barney: "Ted, say 'I'm' your best friend."

Well, hey, you! Be my best friend!
Shoot me an email, let's chat: hanyutseng.hyt@gmail.com`;

const ADDRESS = "hanyutseng.hyt@gmail.com";
const MAILTO = `mailto:${ADDRESS}`;

const FG = "rgb(211, 233, 230)";
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
  title: "cmd-email/Email",
  render: ({ effects }) => <Terminal effects={effects} />,
  parameters: { viewport: { options: VIEWPORTS } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- helpers ----------

const spyArgs = () => ({ effects: { navigate: fn() } });

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

export const TC2: Story = {
  name: "TC-CMD-EMAIL-2: `email` prints exactly the PRD's text, every time",
  args: spyArgs(),
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "email");
    await run(input, "email");
    const all = canvas.getAllByTestId("email");
    await expect(all).toHaveLength(2);
    for (const output of all) await expect(text(output)).toBe(PRD_OUTPUT);
  },
};

export const TC3: Story = {
  name: "TC-CMD-EMAIL-3: the address is an underlined accent mailto: link; the rest is fg",
  args: spyArgs(),
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "email");
    const output = within(canvas.getByTestId("email"));
    const links = output.getAllByRole("link");
    await expect(links).toHaveLength(1);
    const [link] = links;
    await expect(link).toHaveAccessibleName(ADDRESS);
    await expect(link.getAttribute("href")).toBe(MAILTO);
    await expect(link.hasAttribute("target")).toBe(false);
    const style = getComputedStyle(link);
    await expect(style.color).toBe(ACCENT);
    await expect(style.textDecorationLine).toBe("underline");
    await expect(
      getComputedStyle(output.getByText("Well, hey, you! Be my best friend!"))
        .color,
    ).toBe(FG);
  },
};

export const TC4: Story = {
  name: "TC-CMD-EMAIL-4: the mail client opens once, at submit; `email foo` is usage",
  args: spyArgs(),
  play: async ({ args, canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const navigate = args.effects!.navigate!;

    await run(input, "email");
    await expect(navigate).toHaveBeenCalledTimes(1);
    await expect(navigate).toHaveBeenCalledWith(MAILTO);

    await run(input, "pwd");
    fireEvent.keyDown(input, { key: "l", ctrlKey: true });
    await run(input, "help");
    await expect(navigate).toHaveBeenCalledTimes(1);

    await run(input, "email foo");
    await expect(
      within(lastEntry(canvas)).getByTestId("entry-output").textContent,
    ).toBe("Usage: email");
    await expect(navigate).toHaveBeenCalledTimes(1);
  },
};

export const TC5: Story = {
  name: "TC-CMD-EMAIL-5: at 375px there is no horizontal scroll",
  args: spyArgs(),
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "email");
    await expect(canvas.getByTestId("email")).toBeVisible();
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  },
};
