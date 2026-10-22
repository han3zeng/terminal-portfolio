import type { ReactNode } from "react";

export const PROMPT = "strangerfornow@han3zeng:~$";

type Props = { children: ReactNode; "data-testid"?: string };

// Prompt + content on one row; below 768px the prompt gets its own line and the
// content follows a `>` on the next one (UI-PROMPT-1).
export function PromptRow({ children, "data-testid": testId }: Props) {
  return (
    <div data-testid={testId} className="flex flex-wrap">
      <span
        data-testid="prompt"
        className="mr-[1ch] shrink-0 text-primary narrow:mr-0 narrow:basis-full"
      >
        {PROMPT}
      </span>
      <span
        data-testid="narrow-marker"
        aria-hidden="true"
        className="mr-[1ch] hidden text-primary narrow:inline"
      >
        &gt;
      </span>
      {children}
    </div>
  );
}
