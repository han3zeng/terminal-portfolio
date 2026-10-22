export type HelpSection = {
  heading: string;
  lines: { name: string; description: string }[];
};

// The PRD's CMD-HELP block as data, in the PRD's order (TC-CMD-HELP-1 compares the
// rendered text with the PRD; TC-CMD-HELP-2 checks the names against the registry).
export const HELP_INTRO = "Available commands in this terminal";

// A command line: two-space indent, the name padded to a 12-character column.
export const helpLine = (name: string, description: string) =>
  `  ${name.padEnd(12)}${description}`;

// The keyboard shortcuts (INPUT-7), in the same column layout. Kept out of HELP_SECTIONS,
// which lists commands only (TC-CMD-HELP-2).
export const HELP_SHORTCUTS: HelpSection = {
  heading: "SHORTCUTS",
  lines: [
    { name: "Tab", description: "Autocomplete a command" },
    { name: "↑ / ↓", description: "Browse command history" },
    { name: "Ctrl+L", description: "Clear the screen" },
    { name: "Ctrl+A", description: "Move cursor to start of line" },
    { name: "Ctrl+K", description: "Delete to end of line" },
  ],
};

// The whole output as plain text: intro, then each section, a blank line between them.
export function helpText(): string {
  return [
    HELP_INTRO,
    ...[...HELP_SECTIONS, HELP_SHORTCUTS].map((section) =>
      [
        section.heading,
        ...section.lines.map((l) => helpLine(l.name, l.description)),
      ].join("\n"),
    ),
  ].join("\n\n");
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    heading: "ABOUT ME",
    lines: [
      { name: "about", description: "Curious about me? Take a peek" },
      { name: "education", description: "Where I earned my brainpower" },
      { name: "email", description: "Shoot me an email" },
      { name: "projects", description: "See what I've been cooking" },
      {
        name: "resume",
        description: "My career highlights, minus all the embarrassing bits",
      },
      { name: "connect", description: "Let's be internet friends" },
      { name: "themes", description: "Change the vibe" },
      { name: "welcome", description: "Back to square one" },
    ],
  },
  {
    heading: "UTILITIES",
    lines: [{ name: "help", description: "List all available commands" }],
  },
  {
    heading: "TERMINAL",
    lines: [
      { name: "clear", description: "Clear the terminal" },
      { name: "history", description: "View command history" },
      { name: "pwd", description: "Print current working directory" },
      { name: "whoami", description: "A stranger, for now" },
    ],
  },
];
