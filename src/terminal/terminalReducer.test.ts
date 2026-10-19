import { describe, expect, it } from "vitest";

import { commands } from "./commands";
import { historyValue, initialState, terminalReducer } from "./terminalReducer";
import type { TerminalState } from "./types";

function submit(state: TerminalState, ...raws: string[]): TerminalState {
  return raws.reduce(
    (s, raw) => terminalReducer(s, { type: "submit", raw, commands }),
    state,
  );
}

describe("terminalReducer", () => {
  it("TC-TERMINAL-SHELL-10: starts with one welcome entry and welcome in history", () => {
    const state = initialState(commands);
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].input).toBe("welcome");
    expect(state.history).toEqual(["welcome"]);
  });

  it("TC-TERMINAL-SHELL-11: records input as typed and skips empty input in history", () => {
    const state = submit(initialState(commands), "  help  ", "   ", "nope");
    expect(state.entries).toHaveLength(4);
    expect(state.entries.map((e) => e.input)).toEqual([
      "welcome",
      "  help  ",
      "   ",
      "nope",
    ]);
    expect(state.history).toEqual(["welcome", "  help  ", "nope"]);
    expect(state.entries[1].history).toEqual(["welcome", "  help  "]);
  });

  it("TC-TERMINAL-SHELL-12: ↑/↓ walk history and stop at both ends", () => {
    let state = submit(initialState(commands), "a", "b");
    const up = () => (state = terminalReducer(state, { type: "historyUp" }));
    const down = () =>
      (state = terminalReducer(state, { type: "historyDown" }));

    up();
    expect(historyValue(state)).toBe("b");
    up();
    expect(historyValue(state)).toBe("a");
    up();
    expect(historyValue(state)).toBe("welcome");
    up();
    expect(historyValue(state)).toBe("welcome");

    down();
    expect(historyValue(state)).toBe("a");
    down();
    expect(historyValue(state)).toBe("b");
    down();
    expect(historyValue(state)).toBe("");
    expect(state.historyIndex).toBeNull();

    const before = state;
    down();
    expect(state).toBe(before);
  });

  it("TC-TERMINAL-SHELL-13: clearing empties entries but keeps history", () => {
    const state = submit(initialState(commands), "a", "b");
    expect(state.entries).toHaveLength(3);

    const cleared = terminalReducer(state, { type: "clearScreen" });
    expect(cleared.entries).toEqual([]);
    expect(cleared.history).toEqual(["welcome", "a", "b"]);

    const viaCommand = submit(state, "clear");
    expect(viaCommand.entries).toEqual([]);
    expect(viaCommand.history).toEqual(["welcome", "a", "b", "clear"]);
  });
});
