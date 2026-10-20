import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, waitFor } from "storybook/test";

import { Terminal } from "./Terminal";

// On the real page the static HTML has `autofocus`, so the browser focuses the input
// before React hydrates. These stories reproduce that: server HTML first, focus, then hydrate.

const meta = {
  title: "terminal-shell/Terminal hydration",
  render: () => <div data-testid="host" />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TC34: Story = {
  name: "TC-TERMINAL-SHELL-34: input focused before hydration shows a solid cursor",
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector<HTMLElement>(
      '[data-testid="host"]',
    )!;
    host.innerHTML = renderToString(<Terminal />);
    const input = host.querySelector("input")!;
    input.focus();
    await expect(document.activeElement).toBe(input);

    const root = hydrateRoot(host, <Terminal />);
    try {
      const cursor = () =>
        host.querySelector('[data-testid="terminal-cursor"]')!;
      await waitFor(() =>
        expect(cursor()).toHaveAttribute("data-state", "solid"),
      );

      input.blur();
      await waitFor(() =>
        expect(cursor()).toHaveAttribute("data-state", "hollow"),
      );
    } finally {
      root.unmount();
    }
  },
};
