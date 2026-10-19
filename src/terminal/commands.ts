import type { CommandDef } from "./types";

// Placeholder output until the command's cmd-* feature lands.
const Stub: CommandDef["Output"] = () => null;

// Alphabetical: Tab hints are listed in registry order.
export const commands: readonly CommandDef[] = [
  { name: "about", takesArgs: false, Output: Stub },
  { name: "clear", takesArgs: false, Output: Stub, clearsScreen: true },
  { name: "connect", takesArgs: true, Output: Stub },
  { name: "education", takesArgs: false, Output: Stub },
  { name: "email", takesArgs: false, Output: Stub },
  { name: "help", takesArgs: false, Output: Stub },
  { name: "history", takesArgs: false, Output: Stub },
  { name: "projects", takesArgs: false, Output: Stub },
  { name: "pwd", takesArgs: false, Output: Stub },
  { name: "resume", takesArgs: false, Output: Stub },
  { name: "themes", takesArgs: true, Output: Stub },
  { name: "welcome", takesArgs: false, Output: Stub },
  { name: "whoami", takesArgs: false, Output: Stub },
];
