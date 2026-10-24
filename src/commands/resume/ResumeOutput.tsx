import type { CommandContext } from "@/terminal/types";

import { RESUME_LINES } from "./resume";

// CMD-RESUME: the download happens in onSubmit; the output is text only, no link.
export function ResumeOutput(props: CommandContext) {
  void props;
  return (
    <div data-testid="resume" className="whitespace-pre-wrap">
      {RESUME_LINES.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
