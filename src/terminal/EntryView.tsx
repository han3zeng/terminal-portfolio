import { PromptRow } from "./Prompt";
import type { CommandDef, Entry } from "./types";

type Props = { entry: Entry; commands: readonly CommandDef[] };

// One past command: its prompt line, then its output. Rendering never runs side effects.
export function EntryView({ entry, commands }: Props) {
  return (
    <div data-testid="terminal-entry">
      <PromptRow>
        <span
          data-testid="entry-command"
          className="min-w-0 flex-1 whitespace-pre-wrap break-all"
        >
          {entry.input}
        </span>
      </PromptRow>
      <EntryOutput entry={entry} commands={commands} />
    </div>
  );
}

function EntryOutput({ entry, commands }: Props) {
  const { resolution } = entry;
  switch (resolution.kind) {
    case "empty":
      return null;
    case "not-found":
      return (
        <div
          data-testid="entry-output"
          className="whitespace-pre-wrap break-all"
        >
          command not found: {entry.input}
        </div>
      );
    case "usage":
      return <div data-testid="entry-output">Usage: {resolution.name}</div>;
    case "command": {
      const def = commands.find((c) => c.name === resolution.name);
      if (!def) return null;
      return (
        <div data-testid="entry-output">
          <def.Output args={resolution.args} history={entry.history} />
        </div>
      );
    }
  }
}
