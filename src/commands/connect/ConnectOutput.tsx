import type { CommandContext } from "@/terminal/types";

import {
  CONNECT_INTRO,
  CONNECT_USAGE,
  LINKS,
  linkPrefix,
  parseConnectArgs,
  usageLine,
} from "./connect";

// CMD-CONNECT: one block row per line; a blank row holds a non-breaking space
// (an empty row would collapse). Link rows have a 17-character hanging indent, so a
// wrapped URL continues under the URL column.
function Usage() {
  return (
    <>
      <div data-testid="connect-usage-heading" className="text-primary">
        USAGE
      </div>
      <ul className="list-none">
        {CONNECT_USAGE.map(({ command, description }) => (
          <li key={command}>{usageLine(command, description)}</li>
        ))}
      </ul>
    </>
  );
}

export function ConnectOutput({ args }: CommandContext) {
  switch (parseConnectArgs(args).kind) {
    case "list":
      return (
        <div data-testid="connect" className="whitespace-pre-wrap">
          <div>{CONNECT_INTRO}</div>
          <div>{"\u00a0"}</div>
          <ul className="list-none">
            {LINKS.map(({ name, url }, i) => (
              <li key={url} className="-indent-[17ch] pl-[17ch]">
                {linkPrefix(i, name)}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-accent underline"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
          <div>{"\u00a0"}</div>
          <Usage />
        </div>
      );
    case "go":
      // The link opens in onSubmit; nothing is printed.
      return null;
    case "usage":
      return (
        <div className="whitespace-pre-wrap">
          <Usage />
        </div>
      );
  }
}
