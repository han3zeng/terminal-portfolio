import { Fragment } from "react";

import type { CommandContext } from "@/terminal/types";

import { PROJECTS } from "./projects";

// CMD-PROJECTS: titles in accent; URLs are underlined accent links opening a new tab;
// descriptions in fg. A blank row holds a non-breaking space: an empty row would collapse.
export function ProjectsOutput(props: CommandContext) {
  void props;
  return (
    <div data-testid="projects" className="whitespace-pre-wrap">
      {PROJECTS.map((project, i) => (
        <Fragment key={project.title}>
          {i > 0 && <div>{" "}</div>}
          <div data-testid="project-title" className="text-accent">
            {project.title}
          </div>
          {project.urls.map((url) => (
            <div key={url}>
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
            <div key={line}>{line}</div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
