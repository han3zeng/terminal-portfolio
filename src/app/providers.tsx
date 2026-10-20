"use client";

import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";

import { dropUnknownStoredTheme } from "@/themes/storedTheme";
import { ThemeColorMeta } from "@/themes/ThemeColorMeta";
import { THEME_PROVIDER_PROPS } from "@/themes/themes";

export function Providers({ children }: { children: ReactNode }) {
  // Runs once, before ThemeProvider reads storage on its first render.
  useState(() => {
    if (typeof window !== "undefined") dropUnknownStoredTheme();
  });
  return (
    <ThemeProvider {...THEME_PROVIDER_PROPS}>
      <ThemeColorMeta />
      {children}
    </ThemeProvider>
  );
}
