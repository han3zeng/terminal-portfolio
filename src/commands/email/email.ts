// CMD-EMAIL: the PRD's text and address.
export const EMAIL_ADDRESS = "hanyutseng.hyt@gmail.com";
export const MAILTO = `mailto:${EMAIL_ADDRESS}`;

export const EMAIL_QUOTE = [
  "My favorite quote from the show How I Met Your Mother",
  `Barney: "Ted, say 'I'm' your best friend."`,
];
export const EMAIL_INVITE = "Well, hey, you! Be my best friend!";
// The last line ends with the address.
export const EMAIL_LEAD = "Shoot me an email, let's chat: ";

// Plain text as printed, lines joined by "\n".
export function emailText(): string {
  return [...EMAIL_QUOTE, "", EMAIL_INVITE, EMAIL_LEAD + EMAIL_ADDRESS].join(
    "\n",
  );
}
