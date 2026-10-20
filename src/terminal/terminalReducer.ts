import { resolve } from "./resolve";
import type { CommandDef, TerminalAction, TerminalState } from "./types";

const EMPTY: TerminalState = {
  entries: [],
  history: [],
  historyIndex: null,
  nextId: 0,
};

// The terminal as it is on first load: `initialInput` already submitted (UI-LAYOUT-2).
export function initialState(
  commands: readonly Pick<CommandDef, "name" | "takesArgs" | "clearsScreen">[],
  initialInput = "welcome",
): TerminalState {
  return terminalReducer(EMPTY, {
    type: "submit",
    raw: initialInput,
    commands,
  });
}

export function terminalReducer(
  state: TerminalState,
  action: TerminalAction,
): TerminalState {
  switch (action.type) {
    case "submit": {
      const resolution = resolve(action.raw, action.commands);
      // Empty input prints a prompt line but is not recorded (INPUT-2).
      const history =
        resolution.kind === "empty"
          ? state.history
          : [...state.history, action.raw];
      const clears =
        resolution.kind === "command" &&
        action.commands.find((c) => c.name === resolution.name)?.clearsScreen;
      const entry = {
        id: state.nextId,
        input: action.raw,
        resolution,
        history,
      };
      return {
        entries: clears ? [] : [...state.entries, entry],
        history,
        historyIndex: null,
        nextId: state.nextId + 1,
      };
    }
    case "clearScreen":
      return { ...state, entries: [] };
    case "historyUp": {
      if (state.history.length === 0) return state;
      const index =
        state.historyIndex === null
          ? state.history.length - 1
          : Math.max(0, state.historyIndex - 1);
      return index === state.historyIndex
        ? state
        : { ...state, historyIndex: index };
    }
    case "historyDown": {
      if (state.historyIndex === null) return state;
      const index = state.historyIndex + 1;
      return {
        ...state,
        historyIndex: index < state.history.length ? index : null,
      };
    }
  }
}

// The input value to show for the current history position ("" when not navigating).
export function historyValue(state: TerminalState): string {
  return state.historyIndex === null ? "" : state.history[state.historyIndex];
}
