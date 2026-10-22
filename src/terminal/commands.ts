import { About } from "@/commands/about/About";
import { ConnectOutput } from "@/commands/connect/ConnectOutput";
import { Education } from "@/commands/education/Education";
import { Help } from "@/commands/help/Help";
import { History } from "@/commands/history/History";
import { ProjectsOutput } from "@/commands/projects/ProjectsOutput";
import { Pwd } from "@/commands/pwd/Pwd";
import { Welcome } from "@/commands/welcome/Welcome";
import { Whoami } from "@/commands/whoami/Whoami";
import { parseThemesArgs } from "@/themes/parseThemesArgs";
import { ThemesOutput } from "@/themes/ThemesOutput";

import type { CommandDef } from "./types";

// Placeholder output until the command's cmd-* feature lands.
const Stub: CommandDef["Output"] = () => null;

// Alphabetical: Tab hints are listed in registry order.
export const commands: readonly CommandDef[] = [
  { name: "about", takesArgs: false, Output: About },
  { name: "clear", takesArgs: false, Output: Stub, clearsScreen: true },
  { name: "connect", takesArgs: true, Output: ConnectOutput },
  { name: "education", takesArgs: false, Output: Education },
  { name: "email", takesArgs: false, Output: Stub },
  { name: "help", takesArgs: false, Output: Help },
  { name: "history", takesArgs: false, Output: History },
  { name: "projects", takesArgs: false, Output: ProjectsOutput },
  { name: "pwd", takesArgs: false, Output: Pwd },
  { name: "resume", takesArgs: false, Output: Stub },
  {
    name: "themes",
    takesArgs: true,
    Output: ThemesOutput,
    onSubmit: ({ args }, { setTheme }) => {
      const parsed = parseThemesArgs(args);
      if (parsed.kind === "set") setTheme(parsed.theme);
    },
  },
  { name: "welcome", takesArgs: false, Output: Welcome },
  { name: "whoami", takesArgs: false, Output: Whoami },
];
