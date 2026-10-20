import { PALETTES, THEME_PROVIDER_PROPS } from "./themes";

// next-themes applies whatever is stored under its key, even an unknown name
// (e.g. one from an older version). Unknown values are removed before it reads them,
// so it falls back to the default theme (TC-THEMES-12).
//
// This runs twice with the same logic: as an inline <head> script on the real page
// (before next-themes' own inline script, so the first paint is right), and on the
// client before ThemeProvider first renders (stories have no head script).
// The head script also sets <meta name="theme-color"> to the saved theme's bg.

const KEY = THEME_PROVIDER_PROPS.storageKey;
const BG = Object.fromEntries(
  Object.entries(PALETTES).map(([name, palette]) => [name, palette.bg]),
);

export function dropUnknownStoredTheme(): void {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored !== null && !Object.hasOwn(BG, stored)) {
      localStorage.removeItem(KEY);
    }
  } catch {
    // Storage blocked: next-themes falls back to the default on its own.
  }
}

// The inline <head> script (a string; it runs before React or any bundle loads).
export function themeHeadScript(): string {
  return `(function(){try{var k=${JSON.stringify(KEY)},bg=${JSON.stringify(BG)},t=localStorage.getItem(k);if(t!==null&&!Object.prototype.hasOwnProperty.call(bg,t)){localStorage.removeItem(k);t=null}var m=document.querySelector('meta[name="theme-color"]');if(m&&t)m.setAttribute("content",bg[t])}catch(e){}})()`;
}
