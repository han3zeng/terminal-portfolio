import type { Metadata } from "next";

import { BASE_PATH, SITE_URL } from "@/site";

export const TITLE = "Han Zeng — Terminal Portfolio";
export const DESCRIPTION =
  "Terminal-style portfolio of Han Zeng, front-end engineer.";

// The images are static route handlers (og.png/, icon-32.png/, apple-touch-icon.png/), not
// the opengraph-image / icon file conventions: with `output: "export"` those are written
// without a file extension, icon links miss the base path, and twitter:image gets its own URL.
export const OG_IMAGE = {
  url: "/og.png", // relative to metadataBase
  width: 1200,
  height: 630,
  alt: TITLE,
  type: "image/png",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      {
        // Metadata icon URLs do not get the base path added automatically.
        url: `${BASE_PATH}/icon-32.png`,
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: [
      {
        url: `${BASE_PATH}/apple-touch-icon.png`,
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

// <meta name="theme-color"> is rendered in layout.tsx (it follows the saved theme).
