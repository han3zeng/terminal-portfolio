import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "storybook/test";

import { Terminal } from "./Terminal";
import type { CommandContext, CommandDef } from "./types";

// Test hooks the Terminal must render (spec: "Test hooks"):
// - input: role textbox, accessible name "Terminal input"
// - data-testid="terminal-entries": the aria-live region holding the entries
// - data-testid="terminal-entry": one per entry, containing
//   "prompt", "narrow-marker" (the `>`), "entry-command" (raw input) and,
//   when there is output, "entry-output"
// - data-testid="input-line": the live prompt + input row (also has "prompt" and "narrow-marker")
// - data-testid="input-mirror": the drawn input text, containing data-testid="terminal-cursor"
//   with data-state="solid" | "hollow"
// - data-testid="terminal-hints": Tab hints, absent when there are none

const PROMPT = "visitor@han3zeng:~$";

// Fake registry, so these tests don't depend on what the real commands print.
function fakeCommands(onFx: (ctx: CommandContext) => void): CommandDef[] {
  return [
    { name: "about", takesArgs: false, Output: () => <p>About output</p> },
    { name: "clear", takesArgs: false, Output: () => null, clearsScreen: true },
    {
      name: "fx",
      takesArgs: false,
      Output: () => <p>fx output</p>,
      onSubmit: onFx,
    },
    { name: "help", takesArgs: false, Output: () => <p>Help output</p> },
    {
      name: "history",
      takesArgs: false,
      Output: ({ history }) => <p>{history.join(",")}</p>,
    },
    {
      name: "links",
      takesArgs: false,
      Output: () => <a href="#link-target">a link</a>,
    },
    { name: "welcome", takesArgs: false, Output: () => <p>Welcome output</p> },
  ];
}

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "667px" },
    type: "mobile",
  },
  w767: {
    name: "767px",
    styles: { width: "767px", height: "1024px" },
    type: "tablet",
  },
  w768: {
    name: "768px",
    styles: { width: "768px", height: "1024px" },
    type: "tablet",
  },
  w1024: {
    name: "1024px",
    styles: { width: "1024px", height: "768px" },
    type: "desktop",
  },
} as const;

type Args = { onFx: (ctx: CommandContext) => void };

const meta = {
  title: "terminal-shell/Terminal",
  args: { onFx: fn() },
  render: ({ onFx }) => <Terminal commands={fakeCommands(onFx)} />,
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

const entries = (canvas: Canvas) => canvas.queryAllByTestId("terminal-entry");
const lastEntry = (canvas: Canvas) => {
  const all = entries(canvas);
  return all[all.length - 1];
};
const outputText = (entry: HTMLElement) =>
  within(entry).queryByTestId("entry-output")?.textContent ?? "";

async function run(input: HTMLInputElement, text: string) {
  await userEvent.clear(input);
  if (text) await userEvent.type(input, text);
  await userEvent.keyboard("{Enter}");
}

// Returns true when the shortcut's default action was prevented.
// True if the keydown's default browser action was prevented (shortcuts must; other keys must not).
const press = (input: HTMLInputElement, init: KeyboardEventInit) =>
  !fireEvent.keyDown(input, init);

const mirrorText = (canvas: Canvas) =>
  canvas.getByTestId("input-mirror").textContent;

const sameRow = (a: DOMRect, b: DOMRect) =>
  a.top < b.bottom && b.top < a.bottom;

// True if a `prefers-reduced-motion: reduce` rule sets animation to none on `el`.
// Walks nested rules, so it works for plain CSS, @layer, and CSS nesting (Tailwind v4).
function reducedMotionStopsAnimation(el: Element): boolean {
  type Ctx = { reduce: boolean; matches: boolean };
  const walk = (rules: CSSRuleList, ctx: Ctx): boolean => {
    for (const rule of Array.from(rules)) {
      let next = ctx;
      if (rule instanceof CSSMediaRule) {
        next = {
          ...ctx,
          reduce:
            ctx.reduce ||
            /prefers-reduced-motion:\s*reduce/.test(rule.media.mediaText),
        };
      } else if (rule instanceof CSSStyleRule) {
        let matches = false;
        try {
          matches = el.matches(rule.selectorText);
        } catch {
          matches = ctx.matches && rule.selectorText.includes("&");
        }
        next = { ...ctx, matches };
      }
      const style = (rule as CSSStyleRule).style as
        CSSStyleDeclaration | undefined;
      if (style && next.reduce && next.matches) {
        const value = `${style.getPropertyValue("animation")} ${style.getPropertyValue("animation-name")}`;
        if (/\bnone\b/.test(value)) return true;
      }
      const children = (rule as CSSGroupingRule).cssRules;
      if (children && walk(children, next)) return true;
    }
    return false;
  };
  return Array.from(document.styleSheets).some((sheet) => {
    try {
      return walk(sheet.cssRules, { reduce: false, matches: false });
    } catch {
      return false; // cross-origin sheet
    }
  });
}

// ---------- stories ----------

export const TC14: Story = {
  name: "TC-TERMINAL-SHELL-14: runs welcome on first render",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const all = entries(canvas);
    await expect(all).toHaveLength(1);
    const entry = within(all[0]);
    await expect(entry.getByTestId("prompt")).toHaveTextContent(PROMPT);
    await expect(entry.getByTestId("entry-command")).toHaveTextContent(
      "welcome",
    );
    await expect(outputText(all[0])).toContain("Welcome output");
    await waitFor(() => expect(input).toHaveFocus());
    await expect(input).toHaveValue("");
  },
};

export const TC15: Story = {
  name: "TC-TERMINAL-SHELL-15: Enter prints the prompt line and the output",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "about");
    const entry = lastEntry(canvas);
    await expect(entries(canvas)).toHaveLength(2);
    await expect(within(entry).getByTestId("prompt")).toHaveTextContent(PROMPT);
    await expect(within(entry).getByTestId("entry-command")).toHaveTextContent(
      "about",
    );
    await expect(outputText(entry)).toContain("About output");
    await expect(input).toHaveValue("");
  },
};

export const TC16: Story = {
  name: "TC-TERMINAL-SHELL-16: whitespace-only input prints only a prompt line",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "   ");
    await expect(entries(canvas)).toHaveLength(2);
    const entry = lastEntry(canvas);
    await expect(within(entry).getByTestId("prompt")).toHaveTextContent(PROMPT);
    await expect(outputText(entry)).toBe("");
  },
};

export const TC17: Story = {
  name: "TC-TERMINAL-SHELL-17: unknown input prints command not found as typed",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "HELP");
    await expect(outputText(lastEntry(canvas))).toBe("command not found: HELP");

    await run(input, "foo  bar");
    const entry = lastEntry(canvas);
    await expect(within(entry).getByTestId("entry-command").textContent).toBe(
      "foo  bar",
    );
    await expect(outputText(entry)).toBe("command not found: foo  bar");
    const output = within(entry).getByTestId("entry-output");
    await expect(getComputedStyle(output).whiteSpace).toMatch(/^pre/);
  },
};

export const TC18: Story = {
  name: "TC-TERMINAL-SHELL-18: a no-arg command given args prints usage",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "about foo");
    await expect(outputText(lastEntry(canvas))).toBe("Usage: about");

    await run(input, "clear foo");
    await expect(outputText(lastEntry(canvas))).toBe("Usage: clear");
    await expect(entries(canvas)).toHaveLength(3);
  },
};

export const TC19: Story = {
  name: "TC-TERMINAL-SHELL-19: a side effect runs once, at submit",
  play: async ({ canvasElement, args }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "fx");
    await expect(args.onFx).toHaveBeenCalledTimes(1);

    await run(input, "help");
    press(input, { key: "l", ctrlKey: true });
    await run(input, "about");
    await expect(args.onFx).toHaveBeenCalledTimes(1);

    await run(input, "fx extra");
    await expect(outputText(lastEntry(canvas))).toBe("Usage: fx");
    await expect(args.onFx).toHaveBeenCalledTimes(1);
  },
};

export const TC20: Story = {
  name: "TC-TERMINAL-SHELL-20: ↑/↓ recall history with the caret at the end",
  play: async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    await run(input, "a");
    await run(input, "bb");

    await expect(press(input, { key: "ArrowUp" })).toBe(true);
    await waitFor(() => expect(input).toHaveValue("bb"));
    await expect(input.selectionStart).toBe(2);

    press(input, { key: "ArrowUp" });
    await waitFor(() => expect(input).toHaveValue("a"));
    await expect(press(input, { key: "ArrowDown" })).toBe(true);
    await waitFor(() => expect(input).toHaveValue("bb"));
    press(input, { key: "ArrowDown" });
    await waitFor(() => expect(input).toHaveValue(""));
  },
};

export const TC21: Story = {
  name: "TC-TERMINAL-SHELL-21: Tab completes and lists hints below the input",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await userEvent.type(input, "hel");
    await expect(press(input, { key: "Tab" })).toBe(true);
    await waitFor(() => expect(input).toHaveValue("help "));
    await expect(input).toHaveFocus();

    await userEvent.clear(input);
    await userEvent.type(input, "h");
    press(input, { key: "Tab" });
    const hints = await canvas.findByTestId("terminal-hints");
    await expect(hints).toHaveTextContent(/help/);
    await expect(hints).toHaveTextContent(/history/);
    await expect(hints.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      canvas.getByTestId("input-line").getBoundingClientRect().bottom - 1,
    );

    await userEvent.type(input, "e");
    await waitFor(() =>
      expect(canvas.queryByTestId("terminal-hints")).toBeNull(),
    );
  },
};

export const TC22: Story = {
  name: "TC-TERMINAL-SHELL-22: Ctrl+L clears the screen, keeps input and history",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "about");
    await run(input, "help");
    await expect(entries(canvas)).toHaveLength(3);

    await userEvent.type(input, "abc");
    await expect(press(input, { key: "l", ctrlKey: true })).toBe(true);
    await waitFor(() => expect(entries(canvas)).toHaveLength(0));
    await expect(input).toHaveValue("abc");

    await userEvent.clear(input);
    press(input, { key: "ArrowUp" });
    await waitFor(() => expect(input).toHaveValue("help"));
  },
};

export const TC23: Story = {
  name: "TC-TERMINAL-SHELL-23: Ctrl+A moves the caret and cursor to the start",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await userEvent.type(input, "hello");
    await expect(press(input, { key: "a", ctrlKey: true })).toBe(true);
    await waitFor(() => expect(input.selectionStart).toBe(0));
    await expect(input.selectionEnd).toBe(0);
    await waitFor(() => expect(mirrorText(canvas)).toBe("█hello"));
  },
};

export const TC24: Story = {
  name: "TC-TERMINAL-SHELL-24: Ctrl+K deletes from the caret to the end",
  play: async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    await userEvent.type(input, "hello world");
    input.setSelectionRange(5, 5);
    fireEvent.select(input);
    await expect(press(input, { key: "k", ctrlKey: true })).toBe(true);
    await waitFor(() => expect(input).toHaveValue("hello"));
    await expect(input.selectionStart).toBe(5);
  },
};

export const TC25: Story = {
  name: "TC-TERMINAL-SHELL-25: the cursor follows the caret",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await userEvent.type(input, "abc");
    await waitFor(() => expect(mirrorText(canvas)).toBe("abc█"));
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await waitFor(() => expect(mirrorText(canvas)).toBe("a█bc"));
  },
};

export const TC26: Story = {
  name: "TC-TERMINAL-SHELL-26: hollow, still cursor when blurred; solid, blinking when focused",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const cursor = () => canvas.getByTestId("terminal-cursor");

    input.blur();
    await waitFor(() =>
      expect(cursor()).toHaveAttribute("data-state", "hollow"),
    );
    await expect(getComputedStyle(cursor()).animationName).toBe("none");

    input.focus();
    await waitFor(() =>
      expect(cursor()).toHaveAttribute("data-state", "solid"),
    );
    await expect(getComputedStyle(cursor()).animationName).not.toBe("none");
  },
};

export const TC27: Story = {
  name: "TC-TERMINAL-SHELL-27: reduced motion stops the blink",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    input.focus();
    const cursor = await canvas.findByTestId("terminal-cursor");
    await waitFor(() => expect(cursor).toHaveAttribute("data-state", "solid"));
    // Proxy: no media emulation in story tests, so check a reduced-motion CSS rule applies.
    await expect(reducedMotionStopsAnimation(cursor)).toBe(true);
  },
};

export const TC28: Story = {
  name: "TC-TERMINAL-SHELL-28: Cmd/Meta shortcuts are not intercepted",
  play: async ({ canvasElement }) => {
    const { input } = await setup(canvasElement);
    await userEvent.type(input, "abc");
    await expect(press(input, { key: "a", metaKey: true })).toBe(false);
    await expect(input).toHaveValue("abc");
  },
};

export const TC29: Story = {
  name: "TC-TERMINAL-SHELL-29: a click anywhere focuses the input",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "links");

    input.blur();
    await userEvent.click(canvas.getByTestId("terminal-entries"));
    await waitFor(() => expect(input).toHaveFocus());

    input.blur();
    await userEvent.click(document.body);
    await waitFor(() => expect(input).toHaveFocus());

    // Following a link closes the Vitest browser page, so record whether the
    // terminal prevented the click, then cancel the navigation ourselves.
    // Added after the terminal's document listener, so it runs last.
    let preventedByTerminal: boolean | undefined;
    const record = (e: MouseEvent) => {
      preventedByTerminal = e.defaultPrevented;
      e.preventDefault();
    };
    document.addEventListener("click", record);
    const link = canvas.getByRole("link", { name: "a link" });
    fireEvent.click(link);
    document.removeEventListener("click", record);
    await expect(preventedByTerminal).toBe(false);
  },
};

export const TC30: Story = {
  name: "TC-TERMINAL-SHELL-30: labelled input and a polite live region",
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await expect(input).toBeInTheDocument();
    await expect(canvas.getByTestId("terminal-entries")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  },
};

export const TC31: Story = {
  name: "TC-TERMINAL-SHELL-31: new output keeps the input line in view",
  decorators: [
    (Story) => (
      <div
        data-testid="short-container"
        style={{ height: 200, overflow: "auto" }}
      >
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    for (let i = 0; i < 20; i++) await run(input, "about");

    const box = canvas.getByTestId("short-container").getBoundingClientRect();
    await waitFor(() => {
      const line = canvas.getByTestId("input-line").getBoundingClientRect();
      expect(line.top).toBeGreaterThanOrEqual(box.top - 1);
      expect(line.bottom).toBeLessThanOrEqual(box.bottom + 1);
    });
    const all = entries(canvas);
    const lastBottom = all[all.length - 1].getBoundingClientRect().bottom;
    await expect(
      canvas.getByTestId("input-line").getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(lastBottom - 1);
  },
};

function widePlay(): Story["play"] {
  return async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const line = within(canvas.getByTestId("input-line"));
    await expect(
      sameRow(
        line.getByTestId("prompt").getBoundingClientRect(),
        input.getBoundingClientRect(),
      ),
    ).toBe(true);
    for (const marker of canvas.queryAllByTestId("narrow-marker")) {
      await expect(marker).not.toBeVisible();
    }
  };
}

export const TC32At768: Story = {
  name: "TC-TERMINAL-SHELL-32: wide screens keep the prompt and input on one row (768px)",
  globals: { viewport: { value: "w768", isRotated: false } },
  play: widePlay(),
};

export const TC32At1024: Story = {
  name: "TC-TERMINAL-SHELL-32: wide screens keep the prompt and input on one row (1024px)",
  globals: { viewport: { value: "w1024", isRotated: false } },
  play: widePlay(),
};

function narrowPlay(): Story["play"] {
  return async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "about");

    const line = within(canvas.getByTestId("input-line"));
    const prompt = line.getByTestId("prompt").getBoundingClientRect();
    await expect(prompt.bottom).toBeLessThanOrEqual(
      input.getBoundingClientRect().top + 1,
    );
    await expect(line.getByTestId("narrow-marker")).toBeVisible();
    await expect(line.getByTestId("narrow-marker")).toHaveTextContent(">");
    for (const entry of entries(canvas)) {
      await expect(within(entry).getByTestId("narrow-marker")).toBeVisible();
    }

    await userEvent.type(input, "x".repeat(60));
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
    const box = input.getBoundingClientRect();
    const cursor = canvas
      .getByTestId("terminal-cursor")
      .getBoundingClientRect();
    await expect(cursor.left).toBeGreaterThanOrEqual(box.left - 1);
    await expect(cursor.right).toBeLessThanOrEqual(box.right + 1);
  };
}

export const TC33At375: Story = {
  name: "TC-TERMINAL-SHELL-33: narrow screens put the prompt on its own line (375px)",
  globals: { viewport: { value: "w375", isRotated: false } },
  play: narrowPlay(),
};

export const TC33At767: Story = {
  name: "TC-TERMINAL-SHELL-33: narrow screens put the prompt on its own line (767px)",
  globals: { viewport: { value: "w767", isRotated: false } },
  play: narrowPlay(),
};
