import "../src/app/globals.css";
import type { Preview } from "@storybook/nextjs-vite";

import { jetbrainsMono } from "../src/app/fonts";
import { Providers } from "../src/app/providers";

// Mirror app/layout.tsx, which sets the next/font CSS variable on <html>.
document.documentElement.classList.add(jetbrainsMono.variable);

const preview: Preview = {
  // Same providers as app/layout.tsx (themes).
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
  // The theme lives in localStorage and on <html>, which survive between stories.
  // A story that needs a saved theme sets it in its own beforeEach (runs after this one).
  beforeEach: () => {
    localStorage.removeItem("theme");
    document.documentElement.removeAttribute("data-theme");
  },
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
