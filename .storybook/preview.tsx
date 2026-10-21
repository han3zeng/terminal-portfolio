import "../src/app/globals.css";
import type { Preview } from "@storybook/nextjs-vite";

import { jetbrainsMono } from "../src/app/fonts";
import { Providers } from "../src/app/providers";
import { themeHeadScript } from "../src/themes/storedTheme";

// Mirror app/layout.tsx, which sets the next/font CSS variable on <html>.
document.documentElement.classList.add(jetbrainsMono.variable);

// Mirror app/layout.tsx's inline <head> script, which stories don't have (they render
// components, not the HTML page). An inserted inline script runs synchronously, like the
// real one does while the page is parsed.
function runThemeHeadScript() {
  const script = document.createElement("script");
  script.textContent = themeHeadScript();
  document.head.appendChild(script);
  script.remove();
}

const preview: Preview = {
  // Same as app/layout.tsx: the head script first (after each story's own beforeEach has
  // set any saved theme), then the providers.
  decorators: [
    (Story) => {
      runThemeHeadScript();
      return (
        <Providers>
          <Story />
        </Providers>
      );
    },
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
