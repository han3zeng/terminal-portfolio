// CMD-PROJECTS: the PRD's projects as data. A title includes its number.
export type Project = { title: string; urls: string[]; description: string[] };

export const PROJECTS: Project[] = [
  {
    title: "1. Yahoo News and E-commerce",
    urls: ["https://tw.yahoo.com", "https://tw.buy.yahoo.com"],
    description: [
      "Once, the most representative internet portal and index site in Taiwan.",
      "Yup, I know, once.",
    ],
  },
  {
    title: "2. Recall Election: Live Results and News",
    urls: ["https://hanrecall.pts.org.tw/"],
    description: [
      "Once upon a time, a master of corny jokes became a city mayor in Taiwan.",
      "He was later recalled for making too many corny jokes.",
    ],
  },
  {
    title: "3. PRO360",
    urls: ["https://www.pro360.com.tw"],
    description: [
      "What?! You've never heard of PRO360?",
      "Well, there's a saying among us employees: Thumbtack is our Figma.",
    ],
  },
  {
    title: "4. TW Reporter",
    urls: ["https://www.twreporter.org/"],
    description: [
      "The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.",
    ],
  },
];

// Plain text as printed: title, URLs, description; a blank line between projects.
export function projectsText(projects: Project[]): string {
  return projects
    .map((p) => [p.title, ...p.urls, ...p.description].join("\n"))
    .join("\n\n");
}
