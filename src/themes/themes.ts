export const THEMES = ["dark", "light", "matrix", "ubuntu"] as const;
export type ThemeName = (typeof THEMES)[number];

export type Token =
  "bg" | "bg-alt" | "fg" | "primary" | "accent" | "muted" | "border-subtle";

// Stub (themes spec, Phase A): filled in during implementation.
export const PALETTES = {} as Record<ThemeName, Record<Token, string>>;

export type ThemeProviderConfig = {
  attribute: "data-theme";
  themes: ThemeName[];
  defaultTheme: ThemeName;
  enableSystem: boolean;
  storageKey: string;
  disableTransitionOnChange: boolean;
};

// Stub (themes spec, Phase A): filled in during implementation.
export const THEME_PROVIDER_PROPS = {} as ThemeProviderConfig;
