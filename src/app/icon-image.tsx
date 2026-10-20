import { ImageResponse } from "next/og";

import { DARK, jetbrainsMonoFonts } from "./og-font";

// `>_` in primary on bg, shared by icon.tsx (32×32) and apple-icon.tsx (180×180).
export async function iconImage(side: number) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: DARK.bg,
        color: DARK.primary,
        fontFamily: "JetBrains Mono",
        fontWeight: 700,
        fontSize: side * 0.6,
      }}
    >
      {">_"}
    </div>,
    { width: side, height: side, fonts: await jetbrainsMonoFonts() },
  );
}
