import type { CommandSpec, Resolution } from "./types";

export type ParsedInput = { name: string; args: string[] };

// Trims, then splits on runs of whitespace (INPUT-3). null for empty input.
export function parseInput(raw: string): ParsedInput | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const [name, ...args] = trimmed.split(/\s+/);
  return { name, args };
}

export function resolve(
  raw: string,
  commands: readonly CommandSpec[],
): Resolution {
  const parsed = parseInput(raw);
  if (!parsed) return { kind: "empty" };

  // Case-sensitive, like a real shell.
  const def = commands.find((c) => c.name === parsed.name);
  if (!def) return { kind: "not-found" };
  if (!def.takesArgs && parsed.args.length > 0) {
    return { kind: "usage", name: def.name };
  }
  return { kind: "command", name: def.name, args: parsed.args };
}
