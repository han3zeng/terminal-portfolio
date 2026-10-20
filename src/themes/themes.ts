export const THEMES = ["dark", "light", "matrix", "ubuntu"] as const;
export type ThemeName = (typeof THEMES)[number];

export type Token =
  "bg" | "bg-alt" | "fg" | "primary" | "accent" | "muted" | "border-subtle";

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value);

// PRD Style → Theme colors. globals.css repeats these values (CSS can't import TS);
// TC-THEMES-4 checks that both agree.
export const PALETTES: Record<ThemeName, Record<Token, string>> = {
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
};

export type ThemeProviderConfig = {
  attribute: "data-theme";
  themes: ThemeName[];
  defaultTheme: ThemeName;
  enableSystem: boolean;
  storageKey: string;
  disableTransitionOnChange: boolean;
};

export const THEME_PROVIDER_PROPS: ThemeProviderConfig = {
  attribute: "data-theme",
  themes: [...THEMES],
  defaultTheme: "dark",
  enableSystem: false,
  storageKey: "theme",
  disableTransitionOnChange: true,
};
