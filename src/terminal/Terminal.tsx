"use client";

import { useTheme } from "next-themes";
import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  type SubmitEvent,
  type KeyboardEvent,
} from "react";

import { CommandInput } from "./CommandInput";
import { commands as defaultCommands } from "./commands";
import { complete } from "./complete";
import { EntryView } from "./EntryView";
import { PromptRow } from "./Prompt";
import { resolve } from "./resolve";
import { historyValue, initialState, terminalReducer } from "./terminalReducer";
import type { CommandDef, CommandEffects } from "./types";

export type TerminalProps = {
  commands?: readonly CommandDef[];
  initialInput?: string;
  // Side effects for commands' onSubmit. Defaults to next-themes' setTheme; stories pass spies.
  effects?: CommandEffects;
};

export function Terminal({
  commands = defaultCommands,
  initialInput = "welcome",
  effects,
}: TerminalProps) {
  const { setTheme } = useTheme();
  const [state, dispatch] = useReducer(terminalReducer, undefined, () =>
    initialState(commands, initialInput),
  );
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(false);
  const [hints, setHints] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputLineRef = useRef<HTMLDivElement>(null);
  // Caret to apply once a programmatic value change has rendered.
  const pendingCaret = useRef<number | null>(null);

  const syncCaret = () => {
    const input = inputRef.current;
    if (!input) return;
    setCaret(input.selectionStart ?? input.value.length);
  };

  const setValueAndCaret = (next: string, nextCaret: number) => {
    pendingCaret.current = nextCaret;
    setValue(next);
    setCaret(nextCaret);
  };

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (pendingCaret.current !== null) {
      input.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [value]);

  // Keep the input line in view whenever entries change (UI-LAYOUT-3).
  const isFirstRender = useRef(true);
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    inputLineRef.current?.scrollIntoView({ block: "nearest" });
  }, [state.entries]);

  // `autoFocus` in the static HTML focuses the input before hydration, and React
  // never sees that focus event, so read the focus state once after mount.
  useEffect(() => {
    if (document.activeElement === inputRef.current) setFocused(true);
  }, []);

  // A click anywhere focuses the input (INPUT-5); links still follow their href.
  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    document.addEventListener("click", focusInput);
    return () => document.removeEventListener("click", focusInput);
  }, []);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = value;
    const resolution = resolve(raw, commands);
    // Side effects fire here, once, never during render (INPUT-6).
    if (resolution.kind === "command") {
      const def = commands.find((c) => c.name === resolution.name);
      def?.onSubmit?.(
        { args: resolution.args, history: [...state.history, raw] },
        effects ?? { setTheme },
      );
    }
    dispatch({ type: "submit", raw, commands });
    setValueAndCaret("", 0);
    setHints([]);
  };

  const navigate = (type: "historyUp" | "historyDown") => {
    const next = terminalReducer(state, { type });
    if (next === state) return;
    dispatch({ type });
    const recalled = historyValue(next);
    setValueAndCaret(recalled, recalled.length);
    setHints([]);
  };

  // Shortcuts use Ctrl on every platform; Cmd/Alt combinations are left to the browser (INPUT-7).
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.metaKey || e.altKey) return;
    const input = e.currentTarget;

    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "l":
          e.preventDefault();
          dispatch({ type: "clearScreen" });
          setHints([]);
          return;
        case "a":
          e.preventDefault();
          input.setSelectionRange(0, 0);
          setCaret(0);
          return;
        case "k": {
          e.preventDefault();
          const at = input.selectionStart ?? value.length;
          setValueAndCaret(value.slice(0, at), at);
          setHints([]);
          return;
        }
      }
      return;
    }

    switch (e.key) {
      case "Tab": {
        e.preventDefault();
        const completion = complete(
          value,
          commands.map((c) => c.name),
        );
        if (completion.value !== value) {
          setValueAndCaret(completion.value, completion.value.length);
        }
        setHints(completion.hints);
        return;
      }
      case "ArrowUp":
        e.preventDefault();
        navigate("historyUp");
        return;
      case "ArrowDown":
        e.preventDefault();
        navigate("historyDown");
        return;
    }
  };

  return (
    <div data-testid="terminal" className="p-4 font-mono">
      <div data-testid="terminal-entries" aria-live="polite">
        {state.entries.map((entry) => (
          <EntryView key={entry.id} entry={entry} commands={commands} />
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <div ref={inputLineRef}>
          <PromptRow data-testid="input-line">
            <CommandInput
              ref={inputRef}
              value={value}
              caret={caret}
              focused={focused}
              autoFocus
              onChange={(e) => {
                setValue(e.target.value);
                setHints([]);
                // Editing a recalled entry keeps the ↑/↓ position (like the reference).
                syncCaret();
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={syncCaret}
              onSelect={syncCaret}
              onClick={syncCaret}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </PromptRow>
        </div>
      </form>
      <div aria-live="polite">
        {hints.length > 0 && (
          <div
            data-testid="terminal-hints"
            className="flex flex-wrap gap-x-[2ch] text-muted"
          >
            {hints.map((hint) => (
              <span key={hint}>{hint}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
