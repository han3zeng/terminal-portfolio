import type { ReactNode } from "react";

export const PROMPT = "visitor@han3zeng:~$";

type Props = { children: ReactNode; "data-testid"?: string };

// Prompt + content on one row; at ≤768px the prompt gets its own line and the
// content follows a `>` on the next one (UI-PROMPT-1).
export function PromptRow({ children, "data-testid": testId }: Props) {
  return (
    <div data-testid={testId} className="flex flex-wrap">
      <span
        data-testid="prompt"
        className="mr-[1ch] shrink-0 narrow:mr-0 narrow:basis-full"
      >
        {PROMPT}
      </span>
      <span
        data-testid="narrow-marker"
        aria-hidden="true"
        className="mr-[1ch] hidden narrow:inline"
      >
        &gt;
      </span>
      {children}
    </div>
  );
}
