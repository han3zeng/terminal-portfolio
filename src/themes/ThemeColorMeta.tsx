"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import { isThemeName, PALETTES } from "./themes";

// Keeps <meta name="theme-color"> on the current theme's bg after a switch.
// On load the inline head script has already set it before the first paint.
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (!isThemeName(resolvedTheme)) return;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", PALETTES[resolvedTheme].bg);
  }, [resolvedTheme]);
  return null;
}
