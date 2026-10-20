import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "./Terminal";

// ↑/↓ history navigation after the spec change of 2026-10-20 (Han: follow the reference):
// typing doesn't end navigation; submitting does.

const meta = {
  title: "terminal-shell/Terminal navigation",
  render: () => <Terminal />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

async function run(input: HTMLInputElement, text: string) {
  await userEvent.clear(input);
  if (text) await userEvent.type(input, text);
  await userEvent.keyboard("{Enter}");
}

export const TC35: Story = {
  name: "TC-TERMINAL-SHELL-35: typing keeps the history position; submitting resets it",
  play: async ({ canvasElement }) => {
    const input = (await within(canvasElement).findByRole("textbox", {
      name: "Terminal input",
    })) as HTMLInputElement;
    await run(input, "a");
    await run(input, "b");

    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("b");
    await userEvent.type(input, "x");
    await expect(input).toHaveValue("bx");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("a");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveValue("b");

    await userEvent.type(input, "x");
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("bx");
  },
};
