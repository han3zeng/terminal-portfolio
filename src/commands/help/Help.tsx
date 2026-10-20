import { Fragment } from "react";

import type { CommandContext } from "@/terminal/types";

import { HELP_INTRO, HELP_SECTIONS } from "./helpText";

// CMD-HELP: the PRD's text, one block row per line. Headings are styled rows, not <h2>s
// (the page's only heading is the hidden <h1>); each section's lines are a list.
// A blank row holds a non-breaking space: an empty row would collapse.
export function Help(props: CommandContext) {
  void props;
  return (
    <div data-testid="help" className="whitespace-pre-wrap">
      <div>{HELP_INTRO}</div>
      {HELP_SECTIONS.map((section) => (
        <Fragment key={section.heading}>
          <div>{" "}</div>
          <div data-testid="help-heading" className="text-primary">
            {section.heading}
          </div>
          <ul className="list-none">
            {section.lines.map(({ name, description }) => (
              <li key={name}>{`- ${name}: ${description}`}</li>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
  );
}
