import { iconImage } from "../icon-image";

// Static export: written to out/icon-32.png at build time.
export const dynamic = "force-static";

export function GET() {
  return iconImage(32);
}
