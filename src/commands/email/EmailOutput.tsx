import type { CommandContext } from "@/terminal/types";

import {
  EMAIL_ADDRESS,
  EMAIL_INVITE,
  EMAIL_LEAD,
  EMAIL_QUOTE,
  MAILTO,
} from "./email";

// CMD-EMAIL: the address is a mailto: link, the fallback when the automatic navigation
// does nothing. A blank row holds a non-breaking space: an empty row would collapse.
export function EmailOutput(props: CommandContext) {
  void props;
  return (
    <div data-testid="email" className="whitespace-pre-wrap">
      {EMAIL_QUOTE.map((line) => (
        <div key={line}>{line}</div>
      ))}
      <div>{" "}</div>
      <div>{EMAIL_INVITE}</div>
      <div>
        {EMAIL_LEAD}
        <a href={MAILTO} className="text-accent underline wrap-break-word">
          {EMAIL_ADDRESS}
        </a>
      </div>
    </div>
  );
}
