import type { CommandContext } from "@/terminal/types";

import { PWD_OUTPUT } from "./output";

// CMD-PWD: one line in fg.
export function Pwd(props: CommandContext) {
  void props;
  return <div data-testid="pwd">{PWD_OUTPUT}</div>;
}
