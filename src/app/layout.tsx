import type { Metadata } from "next";
import { jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Han Zeng — Terminal Portfolio",
  description: "Terminal-style portfolio of Han Zeng, front-end engineer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
