import type { CommandContext } from "@/terminal/types";

import { NARROW_BANNER, TEXT_LINES, WIDE_BANNER } from "./art";

// CMD-WELCOME: the banner (wide from 768px, narrow below), two blank lines, two text lines.
// The PRD's graphic is out of scope for now (Han adds it by hand into `welcome`).
export function Welcome(props: CommandContext) {
  void props;
  return (
    <div data-testid="welcome">
      <div data-testid="welcome-description">
        <pre
          data-testid="welcome-banner-wide"
          role="img"
          aria-label="Han Zeng"
          className="text-primary narrow:hidden"
        >
          {WIDE_BANNER}
        </pre>
        <pre
          data-testid="welcome-banner-narrow"
          role="img"
          aria-label="Han Zeng"
          className="hidden text-primary narrow:block"
        >
          {NARROW_BANNER}
        </pre>
        {/* A blank row holds a non-breaking space: an empty row would collapse. */}
        <div className="whitespace-pre-wrap">
          <div>{" "}</div>
          <div>{" "}</div>
          {TEXT_LINES.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
