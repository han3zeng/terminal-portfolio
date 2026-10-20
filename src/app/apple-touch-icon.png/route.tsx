import { iconImage } from "../icon-image";

// Static export: written to out/apple-touch-icon.png at build time.
export const dynamic = "force-static";

export function GET() {
  return iconImage(180);
}
