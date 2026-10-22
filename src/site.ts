// The site's address: the single source for the base path. next.config.ts, playwright.config.ts,
// the app and the tests all import it. No imports here, so the configs can load it too.
// GitHub Pages serves the site under the repo name; plain <a href> and string URLs don't get
// the base path added automatically.
export const BASE_PATH = "/terminal-portfolio";
export const SITE_URL = `https://han3zeng.github.io${BASE_PATH}/`;
