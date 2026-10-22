import type { CommandContext } from "@/terminal/types";

// CMD-HISTORY: the history snapshot taken at submit time, oldest first, exactly as typed.
// Keys are indexes: inputs repeat.
export function History({ history }: CommandContext) {
  return (
    <ul
      data-testid="history"
      className="list-none whitespace-pre-wrap break-all"
    >
      {history.map((input, i) => (
        <li key={i}>{input}</li>
      ))}
    </ul>
  );
}
