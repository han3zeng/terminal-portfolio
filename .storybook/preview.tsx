import "../src/app/globals.css";
import type { Preview } from "@storybook/nextjs-vite";

import { jetbrainsMono } from "../src/app/fonts";

// Mirror app/layout.tsx, which sets the next/font CSS variable on <html>.
document.documentElement.classList.add(jetbrainsMono.variable);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
