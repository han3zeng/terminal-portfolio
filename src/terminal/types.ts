import type { ComponentType } from "react";

export type CommandContext = {
  args: string[];
  // Snapshot of history at submit time, including the submitted command itself.
  history: readonly string[];
};

// Side effects a command's onSubmit may perform (passed in by Terminal, so stories can spy on them).
export type CommandEffects = { setTheme: (theme: string) => void };

export type CommandDef = {
  name: string;
  takesArgs: boolean;
  Output: ComponentType<CommandContext>;
  // Side effect, called once by the submit handler (INPUT-6). Never call it from render.
  onSubmit?: (ctx: CommandContext, effects: CommandEffects) => void;
  // `clear`: the reducer empties the entries instead of adding one.
  clearsScreen?: boolean;
};

export type CommandSpec = Pick<CommandDef, "name" | "takesArgs">;

export type Resolution =
  | { kind: "empty" }
  | { kind: "not-found" }
  | { kind: "usage"; name: string }
  | { kind: "command"; name: string; args: string[] };

export type Entry = {
  id: number;
  // Exactly as typed.
  input: string;
  resolution: Resolution;
  history: readonly string[];
};

export type TerminalState = {
  entries: Entry[];
  history: string[];
  // null = not navigating history with ↑/↓.
  historyIndex: number | null;
  nextId: number;
};

export type TerminalAction =
  | {
      type: "submit";
      raw: string;
      commands: readonly Pick<
        CommandDef,
        "name" | "takesArgs" | "clearsScreen"
      >[];
    }
  | { type: "clearScreen" }
  | { type: "historyUp" }
  | { type: "historyDown" };
