import { ImageResponse } from "next/og";

import { OG_IMAGE } from "./metadata";
import { DARK, jetbrainsMonoFonts } from "./og-font";

const PROMPT = "visitor@han3zeng:~$";

// The wide banner from CMD-WELCOME.
const BANNER = [
  " _   _    _    _   _   _____ _____ _   _  ____",
  "| | | |  / \\  | \\ | | |__  /| ____| \\ | |/ ___|",
  "| |_| | / _ \\ |  \\| |   / / |  _| |  \\| | |  _",
  "|  _  |/ ___ \\| |\\  |  / /_ | |___| |\\  | |_| |",
  "|_| |_/_/   \\_\\_| \\_| /____||_____|_| \\_|\\____|",
].join("\n");

// The Open Graph / Twitter card image, served as og.png.
export async function ogImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 32,
        padding: 64,
        background: DARK.bg,
        color: DARK.fg,
        fontFamily: "JetBrains Mono",
        fontSize: 32,
      }}
    >
      <div style={{ color: DARK.primary }}>{`${PROMPT} welcome`}</div>
      <div style={{ whiteSpace: "pre", fontSize: 34, lineHeight: 1.2 }}>
        {BANNER}
      </div>
      <div>Welcome to my terminal!</div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6em" }}>
        <span style={{ color: DARK.primary }}>{PROMPT}</span>
        {/* The block cursor, drawn as a box: █ isn't in the font's latin subset. */}
        <span
          style={{ width: "0.6em", height: "1.2em", background: DARK.primary }}
        />
      </div>
    </div>,
    {
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
      fonts: await jetbrainsMonoFonts(),
    },
  );
}
