// CMD-PROJECTS: the PRD's projects as data. Numbers are added when printing.
export type Project = { title: string; urls: string[]; description: string[] };

export const PROJECTS: Project[] = [
  {
    title: "Yahoo News and E-commerce",
    urls: ["https://tw.yahoo.com", "https://tw.buy.yahoo.com"],
    description: [
      "Once, the most representative internet portal and index site in Taiwan.",
      "Yup, I know, once.",
    ],
  },
  {
    title: "Recall Election: Live Results and News",
    urls: ["https://hanrecall.pts.org.tw/"],
    description: [
      "Once upon a time, a master of corny jokes became a city mayor in Taiwan.",
      "He was later recalled for making too many corny jokes.",
    ],
  },
  {
    title: "PRO360",
    urls: ["https://www.pro360.com.tw"],
    description: [
      "What?! You've never heard of PRO360?",
      "Well, there's a saying among us employees: Thumbtack is our Figma.",
    ],
  },
  {
    title: "TW Reporter",
    urls: ["https://www.twreporter.org/"],
    description: [
      "The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.",
    ],
  },
];

export const PROJECTS_INTRO = "Selected projects";

// A title line: `  [n] ` (6 characters) then the title.
export const titleLine = (index: number, title: string) =>
  `  [${index + 1}] ${title}`;

// URL and description lines line up with the title text.
export const INDENT = " ".repeat(6);

// Plain text as printed: intro, then title, URLs, description; a blank line between.
export function projectsText(projects: Project[]): string {
  return [
    PROJECTS_INTRO,
    ...projects.map((p, i) =>
      [
        titleLine(i, p.title),
        ...[...p.urls, ...p.description].map((line) => INDENT + line),
      ].join("\n"),
    ),
  ].join("\n\n");
}
