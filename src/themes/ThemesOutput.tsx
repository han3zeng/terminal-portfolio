import type { CommandContext } from "@/terminal/types";

import { parseThemesArgs } from "./parseThemesArgs";
import { THEMES } from "./themes";

// One block row per output line; a blank line is a row holding a non-breaking space
// (a <br> row counts as two lines in innerText, an empty row collapses).
function Usage() {
  return (
    <>
      <div data-testid="themes-usage-heading" className="text-primary">
        ## How to use
      </div>
      <div>themes set [theme_name]</div>
      <div>e.g. themes set matrix</div>
    </>
  );
}

export function ThemesOutput({ args }: CommandContext) {
  switch (parseThemesArgs(args).kind) {
    case "list":
      return (
        <div>
          <div>{THEMES.join(", ")}</div>
          <div>{"\u00a0"}</div>
          <Usage />
        </div>
      );
    case "set":
      // The switch happens in onSubmit; nothing is printed.
      return null;
    case "usage":
      return (
        <div>
          <Usage />
        </div>
      );
  }
}
