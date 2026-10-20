import type { ThemeName } from "./themes";

export type ThemesArgs =
  { kind: "list" } | { kind: "set"; theme: ThemeName } | { kind: "usage" };

export function parseThemesArgs(args: readonly string[]): ThemesArgs {
  void args;
  throw new Error("not implemented");
}
