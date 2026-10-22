import { Fragment } from "react";

import type { CommandContext } from "@/terminal/types";

import { INDENT, PROJECTS, PROJECTS_INTRO, titleLine } from "./projects";

// Every project line has a 6-character hanging indent: its leading spaces are real text,
// and wrapped rows start at 6ch, under the title text.
const LINE = "-indent-[6ch] pl-[6ch]";

// CMD-PROJECTS: titles in accent; URLs are underlined accent links opening a new tab;
// descriptions in fg. A blank row holds a non-breaking space: an empty row would collapse.
export function ProjectsOutput(props: CommandContext) {
  void props;
  return (
    <div data-testid="projects" className="whitespace-pre-wrap">
      <div>{PROJECTS_INTRO}</div>
      {PROJECTS.map((project, i) => (
        <Fragment key={project.title}>
          <div>{" "}</div>
          <div data-testid="project-title" className={`${LINE} text-accent`}>
            {titleLine(i, project.title)}
          </div>
          {project.urls.map((url) => (
            <div key={url} className={LINE}>
              {INDENT}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-accent underline"
              >
                {url}
              </a>
            </div>
          ))}
          {project.description.map((line) => (
            <div key={line} className={LINE}>
              {INDENT + line}
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
