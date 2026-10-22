import type { CommandContext } from "@/terminal/types";

import { parseThemesArgs } from "./parseThemesArgs";
import { THEMES } from "./themes";

const USAGE = [
  "  themes                  list themes",
  "  themes set <name>       switch to theme <name>",
  "  e.g. themes set matrix",
];

// One block row per output line; a blank line is a row holding a non-breaking space
// (a <br> row counts as two lines in innerText, an empty row collapses).
function Usage() {
  return (
    <>
      <div data-testid="themes-usage-heading" className="text-primary">
        USAGE
      </div>
      <ul className="list-none">
        {USAGE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </>
  );
}

export function ThemesOutput({ args }: CommandContext) {
  switch (parseThemesArgs(args).kind) {
    case "list":
      return (
        <div className="whitespace-pre-wrap">
          <div>Available themes</div>
          <div>{" "}</div>
          <ul className="list-none">
            {THEMES.map((theme, i) => (
              <li key={theme}>{`  [${i + 1}] ${theme}`}</li>
            ))}
          </ul>
          <div>{" "}</div>
          <Usage />
        </div>
      );
    case "set":
      // The switch happens in onSubmit; nothing is printed.
      return null;
    case "usage":
      return (
        <div className="whitespace-pre-wrap">
          <Usage />
        </div>
      );
  }
}
