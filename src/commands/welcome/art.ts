// The PRD's CMD-WELCOME blocks, character for character (TC-CMD-WELCOME-1 compares them).

export const WIDE_BANNER = [
  " _   _    _    _   _   _____ _____ _   _  ____",
  "| | | |  / \\  | \\ | | |__  /| ____| \\ | |/ ___|",
  "| |_| | / _ \\ |  \\| |   / / |  _| |  \\| | |  _",
  "|  _  |/ ___ \\| |\\  |  / /_ | |___| |\\  | |_| |",
  "|_| |_/_/   \\_\\_| \\_| /____||_____|_| \\_|\\____|",
].join("\n");

// Replaces the wide banner below 768px.
export const NARROW_BANNER = [
  " _   _    _    _   _",
  "| | | |  / \\  | \\ | |",
  "| |_| | / _ \\ |  \\| |",
  "|  _  |/ ___ \\| |\\  |",
  "|_| |_/_/   \\_\\_| \\_|",
  "",
  " _____ _____ _   _  ____",
  "|__  /| ____| \\ | |/ ___|",
  "  / / |  _| |  \\| | |  _",
  " / /_ | |___| |\\  | |_| |",
  "/____||_____|_| \\_|\\____|",
].join("\n");

// Printed after the banner and two blank lines.
export const TEXT_LINES: readonly [string, string] = [
  "Welcome to my terminal!",
  "Want to get to know me better? Type `help` to see how you can explore here.",
];
