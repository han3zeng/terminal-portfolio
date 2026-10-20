import { isThemeName, type ThemeName } from "./themes";

export type ThemesArgs =
  { kind: "list" } | { kind: "set"; theme: ThemeName } | { kind: "usage" };

// `themes` → list; `themes set <name>` (exact, case-sensitive) → set; anything else → usage.
export function parseThemesArgs(args: readonly string[]): ThemesArgs {
  if (args.length === 0) return { kind: "list" };
  const [verb, name, ...rest] = args;
  if (verb === "set" && isThemeName(name) && rest.length === 0) {
    return { kind: "set", theme: name };
  }
  return { kind: "usage" };
}
