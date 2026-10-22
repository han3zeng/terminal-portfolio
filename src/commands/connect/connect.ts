// CMD-CONNECT: the PRD's links and usage as data.
export type SocialLink = { name: string; url: string };

export const LINKS: SocialLink[] = [];

export const CONNECT_USAGE: { command: string; description: string }[] = [];

export type ConnectArgs =
  { kind: "list" } | { kind: "go"; url: string } | { kind: "usage" };

// Plain text as printed: the full output, or the usage block only.
export function connectText(kind: "list" | "usage"): string {
  void kind;
  throw new Error("not implemented");
}

export function parseConnectArgs(args: string[]): ConnectArgs {
  void args;
  throw new Error("not implemented");
}
