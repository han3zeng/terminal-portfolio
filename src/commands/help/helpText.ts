export type HelpSection = {
  heading: string;
  lines: { name: string; description: string }[];
};

// Stub (cmd-help spec, Phase A): the PRD's text comes during implementation.
export const HELP_INTRO = "";
export const HELP_SECTIONS: HelpSection[] = [];
