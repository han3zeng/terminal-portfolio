import type { CommandSpec, Resolution } from "./types";

export type ParsedInput = { name: string; args: string[] };

// TODO(terminal-shell): implement. Stub so tests fail on assertions, not imports.
export function parseInput(raw: string): ParsedInput | null {
  throw new Error(`parseInput not implemented: ${raw}`);
}

export function resolve(
  raw: string,
  commands: readonly CommandSpec[],
): Resolution {
  throw new Error(`resolve not implemented: ${raw} ${commands.length}`);
}
