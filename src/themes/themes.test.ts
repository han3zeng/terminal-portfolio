import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { contrastRatio } from "./contrast";
import { PALETTES, THEME_PROVIDER_PROPS, type Token } from "./themes";

// The palette table from docs/features/themes/spec.md (light: Han's AA-adjusted values).
const SPEC_PALETTES = {
  dark: {
    bg: "#091321",
    "bg-alt": "#101E30",
    fg: "#D3E9E6",
    primary: "#8FFFE0",
    accent: "#54DCC0",
    muted: "#91ADA9",
    "border-subtle": "#244353",
  },
  light: {
    bg: "#FDF6E3",
    "bg-alt": "#EEE8D5",
    fg: "#586E75",
    primary: "#2074AF",
    accent: "#207B74",
    muted: "#5E737A",
    "border-subtle": "#D6CEBA",
  },
  matrix: {
    bg: "#050B06",
    "bg-alt": "#0C1A0F",
    fg: "#B6F5C5",
    primary: "#00FF41",
    accent: "#39D65A",
    muted: "#75A982",
    "border-subtle": "#244B30",
  },
  ubuntu: {
    bg: "#300A24",
    "bg-alt": "#40142F",
    fg: "#F2EDEB",
    primary: "#8AE234",
    accent: "#E95420",
    muted: "#B9A9B4",
    "border-subtle": "#69465E",
  },
} as const;

const TOKENS: Token[] = [
  "bg",
  "bg-alt",
  "fg",
  "primary",
  "accent",
  "muted",
  "border-subtle",
];

const lower = (palette: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(palette).map(([k, v]) => [k, v.toLowerCase()]),
  );

// Every top-level rule in globals.css as { selectors, variables }.
function cssRules(css: string) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
    ([, selector, body]) => ({
      selectors: selector.split(",").map((s) => s.trim().replace(/'/g, '"')),
      variables: Object.fromEntries(
        [...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, k, v]) => [
          k,
          v.trim().toLowerCase(),
        ]),
      ),
    }),
  );
}

describe("theme palettes", () => {
  it("TC-THEMES-4: globals.css defines all seven tokens per theme, equal to PALETTES and the spec table", () => {
    expect(PALETTES).toEqual(SPEC_PALETTES);

    const css = readFileSync(
      path.resolve(import.meta.dirname, "../app/globals.css"),
      "utf8",
    );
    const rules = cssRules(css);
    const tokensOf = (selector: string) => {
      const rule = rules.find((r) => r.selectors.includes(selector));
      expect(rule, `a rule for ${selector}`).toBeDefined();
      return Object.fromEntries(TOKENS.map((t) => [t, rule!.variables[t]]));
    };

    const darkRule = rules.find((r) => r.selectors.includes(":root"));
    expect(darkRule?.selectors).toContain('[data-theme="dark"]');
    expect(tokensOf(":root")).toEqual(lower(SPEC_PALETTES.dark));
    for (const theme of ["light", "matrix", "ubuntu"] as const) {
      expect({ theme, tokens: tokensOf(`[data-theme="${theme}"]`) }).toEqual({
        theme,
        tokens: lower(SPEC_PALETTES[theme]),
      });
    }
  });

  it("TC-THEMES-5: contrastRatio follows WCAG, and fg, primary, muted and accent reach 4.5:1 on bg in every theme", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 2);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 2);

    const failing: string[] = [];
    for (const [theme, palette] of Object.entries(SPEC_PALETTES)) {
      for (const token of ["fg", "primary", "muted", "accent"] as const) {
        const ratio = contrastRatio(palette[token], palette.bg);
        if (ratio < 4.5) failing.push(`${theme} ${token} ${ratio.toFixed(2)}`);
      }
    }
    expect(failing).toEqual([]);
  });

  it("TC-THEMES-6: next-themes is configured as CLAUDE.md and the spec say", () => {
    expect(THEME_PROVIDER_PROPS).toEqual({
      attribute: "data-theme",
      themes: ["dark", "light", "matrix", "ubuntu"],
      defaultTheme: "dark",
      enableSystem: false,
      storageKey: "theme",
      disableTransitionOnChange: true,
    });
  });
});
