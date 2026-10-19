import type { CommandDef, TerminalAction, TerminalState } from "./types";

// TODO(terminal-shell): implement. Stubs so tests fail on assertions, not imports.
export function initialState(
  commands: readonly Pick<CommandDef, "name" | "takesArgs">[],
  initialInput = "welcome",
): TerminalState {
  throw new Error(
    `initialState not implemented: ${initialInput} ${commands.length}`,
  );
}

export function terminalReducer(
  state: TerminalState,
  action: TerminalAction,
): TerminalState {
  throw new Error(
    `terminalReducer not implemented: ${action.type} ${state.nextId}`,
  );
}

// The input value to show for the current history position ("" when not navigating).
export function historyValue(state: TerminalState): string {
  throw new Error(`historyValue not implemented: ${state.historyIndex}`);
}
