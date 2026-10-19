import { JetBrains_Mono } from "next/font/google";

// Shared by app/layout.tsx and .storybook/preview.tsx so stories render with the same font.
export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
