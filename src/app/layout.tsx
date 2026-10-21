import { themeHeadScript } from "@/themes/storedTheme";
import { PALETTES } from "@/themes/themes";

import { jetbrainsMono } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";

export { metadata } from "./metadata";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets data-theme on <html> before hydration, so server and client differ there.
    <html
      lang="en"
      className={`${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Rendered here, not via metadata, so it is guaranteed to come before the script below. */}
        <meta name="theme-color" content={PALETTES.dark.bg} />
        {/* Runs while the HTML is parsed, before the first paint and before React loads:
            sets theme-color to the saved theme and drops an unknown saved theme.
            React effects run too late for the first frame. See src/themes/storedTheme.ts. */}
        <script dangerouslySetInnerHTML={{ __html: themeHeadScript() }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
