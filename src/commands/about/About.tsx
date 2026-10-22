import type { CommandContext } from "@/terminal/types";

import { ABOUT_OUTPUT } from "./output";

// CMD-ABOUT: two lines in fg; the first wraps at word boundaries on narrow screens.
export function About(props: CommandContext) {
  void props;
  return (
    <div data-testid="about" className="whitespace-pre-wrap">
      {ABOUT_OUTPUT}
    </div>
  );
}
