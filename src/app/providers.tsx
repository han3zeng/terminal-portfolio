"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { ThemeColorMeta } from "@/themes/ThemeColorMeta";
import { THEME_PROVIDER_PROPS } from "@/themes/themes";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider {...THEME_PROVIDER_PROPS}>
      <ThemeColorMeta />
      {children}
    </ThemeProvider>
  );
}
