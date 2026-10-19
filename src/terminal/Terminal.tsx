"use client";

import type { CommandDef } from "./types";

export type TerminalProps = {
  commands?: readonly CommandDef[];
  initialInput?: string;
};

// TODO(terminal-shell): implement. Stub so stories fail on assertions, not imports.
export function Terminal(props: TerminalProps) {
  void props;
  return null;
}
