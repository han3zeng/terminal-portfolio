import { ogImage } from "../og-image";

// Static export: written to out/og.png at build time.
export const dynamic = "force-static";

export function GET() {
  return ogImage();
}
