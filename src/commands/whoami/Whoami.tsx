import type { CommandContext } from "@/terminal/types";

import { WHOAMI_OUTPUT } from "./output";

// CMD-WHOAMI: one line in fg; wraps at word boundaries on narrow screens.
export function Whoami(props: CommandContext) {
  void props;
  return (
    <div data-testid="whoami" className="whitespace-pre-wrap">
      {WHOAMI_OUTPUT}
    </div>
  );
}
