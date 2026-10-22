import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "./Terminal";

// Regression (2026-10-22): a caret position set from code while the value stayed the same
// (empty Enter, Ctrl+K at the end, ↑ recalling the same text) was applied on the next
// keystroke instead, so the first typed character ended up at the tail ("help" → "elph").
// Keys are sent with userEvent.keyboard, which types at the input's real caret; userEvent.type
// and userEvent.clear move the caret themselves and would hide the bug.

const meta = {
  title: "terminal-shell/Terminal caret",
  render: () => <Terminal />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

async function setup(canvasElement: HTMLElement) {
  const input = (await within(canvasElement).findByRole("textbox", {
    name: "Terminal input",
  })) as HTMLInputElement;
  input.focus();
  return input;
}

export const TC36: Story = {
  name: "TC-TERMINAL-SHELL-36: typing after empty Enters keeps the typed order",
  play: async ({ canvasElement }) => {
    const input = await setup(canvasElement);
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("help");
    await expect(input).toHaveValue("help");

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Enter}{Enter}{Enter}");
    await userEvent.keyboard("pwd");
    await expect(input).toHaveValue("pwd");
  },
};

export const TC37: Story = {
  name: "TC-TERMINAL-SHELL-37: typing after Ctrl+K at the end keeps the typed order",
  play: async ({ canvasElement }) => {
    const input = await setup(canvasElement);
    await userEvent.keyboard("pwd");
    await userEvent.keyboard("{Control>}k{/Control}");
    await expect(input).toHaveValue("pwd");
    await userEvent.keyboard("xy");
    await expect(input).toHaveValue("pwdxy");
  },
};

export const TC38: Story = {
  name: "TC-TERMINAL-SHELL-38: typing after ↑ recalls the same text keeps the typed order",
  play: async ({ canvasElement }) => {
    const input = await setup(canvasElement);
    await userEvent.keyboard("pwd{Enter}");
    await userEvent.keyboard("pwd");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("pwd");
    await userEvent.keyboard("xy");
    await expect(input).toHaveValue("pwdxy");
  },
};
