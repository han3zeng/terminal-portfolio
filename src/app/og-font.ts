import { readFile } from "node:fs/promises";
import path from "node:path";

// ImageResponse can't read woff2 (what next/font downloads), so the generated
// images load JetBrains Mono's woff files from @fontsource at build time.
const fontFile = (weight: 400 | 700) =>
  readFile(
    path.join(
      process.cwd(),
      `node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff`,
    ),
  );

export async function jetbrainsMonoFonts() {
  const [regular, bold] = await Promise.all([fontFile(400), fontFile(700)]);
  return [
    { name: "JetBrains Mono", data: regular, weight: 400 as const },
    { name: "JetBrains Mono", data: bold, weight: 700 as const },
  ];
}

// Dark theme tokens (globals.css), for images drawn outside the page.
export const DARK = { bg: "#091321", fg: "#D3E9E6", primary: "#8FFFE0" };
