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
        {/* Rendered here, not via metadata, so the script below can find it while the page parses. */}
        <meta name="theme-color" content={PALETTES.dark.bg} />
        <script dangerouslySetInnerHTML={{ __html: themeHeadScript() }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
