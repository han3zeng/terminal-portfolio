import type { CommandContext } from "@/terminal/types";

import { EDUCATION_OUTPUT } from "./output";

// CMD-EDUCATION: one block row per line, all fg.
// A blank row holds a non-breaking space: an empty row would collapse.
export function Education(props: CommandContext) {
  void props;
  return (
    <div data-testid="education" className="whitespace-pre-wrap">
      {EDUCATION_OUTPUT.split("\n").map((line, i) => (
        <div key={i}>{line || " "}</div>
      ))}
    </div>
  );
}
