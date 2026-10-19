export type Completion = { value: string; hints: string[] };

// TODO(terminal-shell): implement. Stub so tests fail on assertions, not imports.
export function complete(input: string, names: readonly string[]): Completion {
  throw new Error(`complete not implemented: ${input} ${names.length}`);
}
