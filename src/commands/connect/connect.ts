// CMD-CONNECT: the PRD's links and usage as data.
export type SocialLink = { name: string; url: string };

export const LINKS: SocialLink[] = [
  { name: "Substack", url: "https://substack.com/@han3zeng" },
  { name: "GitHub", url: "https://github.com/han3zeng" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/han3zeng" },
];

export const CONNECT_INTRO = "Let's connect!";

export const CONNECT_USAGE: { command: string; description: string }[] = [
  { command: "connect", description: "list links" },
  { command: "connect go <n>", description: "open link <n> in a new tab" },
];

// A link row up to its URL: `  [n] ` then the name padded to 11 characters (17 in all).
export const linkPrefix = (index: number, name: string) =>
  `  [${index + 1}] ${name.padEnd(11)}`;

// A usage row: two-space indent, the command padded to a 19-character column.
export const usageLine = (command: string, description: string) =>
  `  ${command.padEnd(19)}${description}`;

export type ConnectArgs =
  { kind: "list" } | { kind: "go"; url: string } | { kind: "usage" };

// Plain text as printed: the full output, or the usage block only.
export function connectText(kind: "list" | "usage"): string {
  const usage = [
    "USAGE",
    ...CONNECT_USAGE.map((u) => usageLine(u.command, u.description)),
  ].join("\n");
  if (kind === "usage") return usage;
  const links = LINKS.map((l, i) => linkPrefix(i, l.name) + l.url).join("\n");
  return [CONNECT_INTRO, links, usage].join("\n\n");
}

// n must be exactly "1", "2" or "3" (no "01", "+1", "1.0").
export function parseConnectArgs(args: string[]): ConnectArgs {
  if (args.length === 0) return { kind: "list" };
  if (args.length === 2 && args[0] === "go") {
    const index = ["1", "2", "3"].indexOf(args[1]);
    if (index !== -1) return { kind: "go", url: LINKS[index].url };
  }
  return { kind: "usage" };
}
