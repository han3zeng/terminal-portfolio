import { PALETTES, THEME_PROVIDER_PROPS } from "./themes";

// Why this file exists
//
// On a page load the browser paints the static HTML before any of our JavaScript runs,
// and React (including useEffect and useLayoutEffect) only starts after that. Anything a
// visitor's saved theme should change in the *first* frame therefore has to be done by an
// inline script inside the HTML, which the browser runs while it parses the page.
// next-themes already does this for `data-theme` on <html> (its script sits at the top of
// <body>). It leaves two gaps, which `applyStoredTheme` fills:
//
// 1. <meta name="theme-color"> (the mobile browser's toolbar color). The static HTML ships
//    the dark bg; without this, a visitor who saved another theme would see the toolbar
//    switch from dark after React loads (ThemeColorMeta handles later switches).
//    Checked by TC-THEMES-16.
// 2. Unknown saved names. next-themes applies whatever is stored, so a leftover value
//    (an old theme name, or anything edited by hand) would become data-theme="<junk>".
//    Removing it first makes next-themes fall back to `dark`. Checked by TC-THEMES-12.

const KEY = THEME_PROVIDER_PROPS.storageKey;
const BACKGROUNDS = Object.fromEntries(
  Object.entries(PALETTES).map(([name, palette]) => [name, palette.bg]),
);

// Serialized into the inline <head> script with Function#toString, so it must stay
// self-contained: use only its parameters and browser globals, never imports or
// module-level constants (they don't exist where the script runs).
function applyStoredTheme(key: string, backgrounds: Record<string, string>) {
  try {
    let theme = localStorage.getItem(key);
    if (theme !== null && !Object.hasOwn(backgrounds, theme)) {
      localStorage.removeItem(key);
      theme = null;
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && theme) meta.setAttribute("content", backgrounds[theme]);
  } catch {
    // Storage blocked (e.g. some private modes): keep the dark defaults.
  }
}

// The inline <head> script, rendered by app/layout.tsx. It runs before next-themes' script
// in <body>, so (2) happens before next-themes reads the stored value.
// Storybook has no HTML <head>, so .storybook/preview.tsx runs this same script before
// each story renders.
export function themeHeadScript(): string {
  return `(${applyStoredTheme.toString()})(${JSON.stringify(KEY)}, ${JSON.stringify(BACKGROUNDS)})`;
}
