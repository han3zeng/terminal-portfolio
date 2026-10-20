export type Completion = { value: string; hints: string[] };

// Tab completion of command names only (INPUT-7). Arguments are never completed.
export function complete(input: string, names: readonly string[]): Completion {
  const none = { value: input, hints: [] };
  if (!input || /\s/.test(input)) return none;

  const matches = names.filter((name) => name.startsWith(input));
  if (matches.length === 0) return none;
  if (matches.length === 1) return { value: `${matches[0]} `, hints: [] };
  return { value: commonPrefix(matches), hints: matches };
}

function commonPrefix(words: readonly string[]): string {
  let prefix = words[0];
  for (const word of words) {
    while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}
