export type HelpSection = {
  heading: string;
  lines: { name: string; description: string }[];
};

// The PRD's CMD-HELP block as data, in the PRD's order (TC-CMD-HELP-1 compares the
// rendered text with the PRD; TC-CMD-HELP-2 checks the names against the registry).
export const HELP_INTRO = "These are all available commands in this terminal.";

export const HELP_SECTIONS: HelpSection[] = [
  {
    heading: "About me",
    lines: [
      { name: "about", description: "want to know more about me?" },
      { name: "education", description: "my education background" },
      { name: "email", description: "send an email to me" },
      {
        name: "projects",
        description: "view all work that I have participated in",
      },
      { name: "resume", description: "download my resume" },
      { name: "connect", description: "check out my social accounts" },
      { name: "themes", description: "check available themes" },
      { name: "welcome", description: "display hero section" },
    ],
  },
  {
    heading: "Utilities",
    lines: [{ name: "help", description: "list all available commands" }],
  },
  {
    heading: "Typical terminal commands",
    lines: [
      { name: "clear", description: "clear the terminal" },
      { name: "history", description: "view command history" },
      { name: "pwd", description: "print current working directory" },
      { name: "whoami", description: "people who want to be my friend" },
    ],
  },
];
