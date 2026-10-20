import { jetbrainsMono } from "./fonts";
import "./globals.css";

export { metadata, viewport } from "./metadata";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
