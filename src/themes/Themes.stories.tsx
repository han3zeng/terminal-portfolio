import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

import { commands } from "@/terminal/commands";
import { Terminal } from "@/terminal/Terminal";
import type { CommandDef, CommandEffects } from "@/terminal/types";

// The real Terminal and registry, inside the real Providers (added by .storybook/preview.tsx,
// which also resets the theme before each story). A story that needs a saved theme sets it
// in its own beforeEach, which runs after the preview's reset (loaders run too early).
//
// Test hooks: entry-output (terminal-shell), themes-usage-heading (the `USAGE` line).

type Args = { effects?: Partial<CommandEffects>; extraCommands?: CommandDef[] };

const meta = {
  title: "themes/Themes",
  render: ({ effects, extraCommands = [] }) => (
    <Terminal commands={[...commands, ...extraCommands]} effects={effects} />
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

// The PRD's CMD-THEMES block.
const FULL_OUTPUT = [
  "Available themes",
  "",
  "  [1] dark",
  "  [2] light",
  "  [3] matrix",
  "  [4] ubuntu",
  "",
  "USAGE",
  "  themes                  list themes",
  "  themes set <name>       switch to theme <name>",
  "  e.g. themes set matrix",
];
const USAGE_OUTPUT = FULL_OUTPUT.slice(7);

const BG = {
  dark: "rgb(9, 19, 33)",
  light: "rgb(253, 246, 227)",
  matrix: "rgb(5, 11, 6)",
  ubuntu: "rgb(48, 10, 36)",
};

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

const lastEntry = (canvas: Canvas) => {
  const all = canvas.getAllByTestId("terminal-entry");
  return all[all.length - 1];
};

// The latest entry's output as text lines ([] when it printed nothing).
const outputLines = (canvas: Canvas): string[] => {
  const output = within(lastEntry(canvas)).queryByTestId("entry-output");
  const text = output?.innerText.replace(/\n+$/, "") ?? "";
  return text ? text.split("\n").map((l) => l.trimEnd()) : [];
};

const dataTheme = () => document.documentElement.getAttribute("data-theme");
const bodyBg = () => getComputedStyle(document.body).backgroundColor;
const color = (el: Element) => getComputedStyle(el).color;

const storedTheme =
  (theme: string): Story["beforeEach"] =>
  () => {
    localStorage.setItem("theme", theme);
  };

// ---------- stories ----------

export const TC7: Story = {
  name: "TC-THEMES-7: `themes` lists the themes and the usage",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "themes");
    await expect(outputLines(canvas)).toEqual(FULL_OUTPUT);
    await expect(dataTheme()).toBe("dark");
  },
};

export const TC8: Story = {
  name: "TC-THEMES-8: `themes set <name>` switches immediately, prints nothing and is saved",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);

    await run(input, "themes set ubuntu");
    await expect(outputLines(canvas)).toEqual([]);
    await expect(dataTheme()).toBe("ubuntu");
    await expect(bodyBg()).toBe(BG.ubuntu);
    await expect(getComputedStyle(document.body).transitionDuration).toBe("0s");
    await expect(localStorage.getItem("theme")).toBe("ubuntu");

    for (const theme of ["light", "matrix", "dark"] as const) {
      await run(input, `themes set ${theme}`);
      await expect({ theme: dataTheme(), bg: bodyBg() }).toEqual({
        theme,
        bg: BG[theme],
      });
      await expect(localStorage.getItem("theme")).toBe(theme);
    }
  },
};

export const TC9: Story = {
  name: "TC-THEMES-9: bad arguments print only the usage block and keep the theme",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    for (const text of [
      "themes set foo",
      "themes set Ubuntu",
      "themes set",
      "themes foo",
      "themes set 3",
    ]) {
      await run(input, text);
      await expect({ text, lines: outputLines(canvas) }).toEqual({
        text,
        lines: USAGE_OUTPUT,
      });
      await expect(dataTheme()).toBe("dark");
    }
  },
};

export const TC10: Story = {
  name: "TC-THEMES-10: setTheme is called once, at submit, only for a valid `themes set`",
  args: { effects: { setTheme: fn() } },
  play: async ({ args, canvasElement }) => {
    const { input } = await setup(canvasElement);
    const setTheme = args.effects!.setTheme!;

    await run(input, "themes set matrix");
    await expect(setTheme).toHaveBeenCalledTimes(1);
    await expect(setTheme).toHaveBeenCalledWith("matrix");

    await run(input, "pwd");
    fireEvent.keyDown(input, { key: "l", ctrlKey: true });
    await run(input, "themes");
    await run(input, "themes set foo");
    await expect(setTheme).toHaveBeenCalledTimes(1);
  },
};

export const TC11: Story = {
  name: "TC-THEMES-11: a saved theme is applied on load",
  beforeEach: storedTheme("matrix"),
  play: async ({ canvasElement }) => {
    await setup(canvasElement);
    await waitFor(() => expect(dataTheme()).toBe("matrix"));
    await expect(bodyBg()).toBe(BG.matrix);
  },
};

export const TC12Default: Story = {
  name: "TC-THEMES-12: the first visit is dark",
  play: async ({ canvasElement }) => {
    await setup(canvasElement);
    await waitFor(() => expect(dataTheme()).toBe("dark"));
    await expect(bodyBg()).toBe(BG.dark);
  },
};

export const TC12Unknown: Story = {
  name: "TC-THEMES-12: an unknown saved theme falls back to dark",
  beforeEach: storedTheme("not-a-theme"),
  play: async ({ canvasElement }) => {
    await setup(canvasElement);
    await waitFor(() => expect(dataTheme()).toBe("dark"));
    await expect(bodyBg()).toBe(BG.dark);
  },
};

export const TC13: Story = {
  name: "TC-THEMES-13: prompt, cursor, hints, text, links and headings use their tokens",
  beforeEach: storedTheme("light"),
  args: {
    extraCommands: [
      {
        name: "links",
        takesArgs: false,
        Output: () => <a href="#link-target">a link</a>,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await waitFor(() => expect(dataTheme()).toBe("light"));
    const PRIMARY = "rgb(32, 116, 175)";
    const MUTED = "rgb(94, 115, 122)";
    const FG = "rgb(88, 110, 117)";
    const ACCENT = "rgb(32, 123, 116)";

    await run(input, "pwd");
    const entry = within(lastEntry(canvas));
    await expect(color(entry.getByTestId("prompt"))).toBe(PRIMARY);
    await expect(color(entry.getByTestId("narrow-marker"))).toBe(PRIMARY);
    await expect(color(entry.getByTestId("entry-command"))).toBe(FG);
    const line = within(canvas.getByTestId("input-line"));
    await expect(color(line.getByTestId("prompt"))).toBe(PRIMARY);
    await expect(color(canvas.getByTestId("terminal-cursor"))).toBe(PRIMARY);

    await run(input, "links");
    await expect(
      color(within(lastEntry(canvas)).getByRole("link", { name: "a link" })),
    ).toBe(ACCENT);

    await run(input, "themes");
    const themesOutput = within(lastEntry(canvas));
    await expect(color(themesOutput.getByTestId("themes-usage-heading"))).toBe(
      PRIMARY,
    );
    await expect(color(themesOutput.getByText("[1] dark"))).toBe(FG);

    await userEvent.type(input, "h");
    await userEvent.keyboard("{Tab}");
    await expect(color(canvas.getByTestId("terminal-hints"))).toBe(MUTED);

    input.blur();
    await waitFor(() =>
      expect(canvas.getByTestId("terminal-cursor")).toHaveAttribute(
        "data-state",
        "hollow",
      ),
    );
    await expect(
      getComputedStyle(canvas.getByTestId("terminal-cursor")).outlineColor,
    ).toBe(PRIMARY);
  },
};

export const TC14: Story = {
  name: "TC-THEMES-14: the theme-color meta follows the theme",
  play: async ({ canvasElement }) => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#091321";
    document.head.appendChild(meta);
    try {
      const { input } = await setup(canvasElement);
      await run(input, "themes set ubuntu");
      await waitFor(() => expect(meta.content).toBe("#300A24"));
      await run(input, "themes set light");
      await waitFor(() => expect(meta.content).toBe("#FDF6E3"));
    } finally {
      meta.remove();
    }
  },
};

// Story names must be literals: Storybook reads them statically.
function a11yStory(theme: keyof typeof BG): Omit<Story, "name"> {
  return {
    beforeEach: storedTheme(theme),
    parameters: { a11y: { test: "error" } },
    play: async ({ canvasElement }) => {
      const { canvas, input } = await setup(canvasElement);
      await waitFor(() => expect(dataTheme()).toBe(theme));
      await expect(bodyBg()).toBe(BG[theme]);
      await run(input, "themes");
      await run(input, "nope");
      await userEvent.type(input, "h");
      await userEvent.keyboard("{Tab}");
      await expect(canvas.getByTestId("terminal-hints")).toBeVisible();
    },
  };
}

export const TC15Dark: Story = {
  ...a11yStory("dark"),
  name: "TC-THEMES-15: no a11y violations, including contrast, in the dark theme",
};
export const TC15Light: Story = {
  ...a11yStory("light"),
  name: "TC-THEMES-15: no a11y violations, including contrast, in the light theme",
};
export const TC15Matrix: Story = {
  ...a11yStory("matrix"),
  name: "TC-THEMES-15: no a11y violations, including contrast, in the matrix theme",
};
export const TC15Ubuntu: Story = {
  ...a11yStory("ubuntu"),
  name: "TC-THEMES-15: no a11y violations, including contrast, in the ubuntu theme",
};
