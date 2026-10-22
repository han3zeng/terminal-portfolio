import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

// Test hooks (cmd-projects spec): projects (output root), project-title (each title line).
// The expected text is the PRD's CMD-PROJECTS block, copied here because stories run in the browser.

const PRD_OUTPUT = `1. Yahoo News and E-commerce
https://tw.yahoo.com
https://tw.buy.yahoo.com
Once, the most representative internet portal and index site in Taiwan.
Yup, I know, once.

2. Recall Election: Live Results and News
https://hanrecall.pts.org.tw/
Once upon a time, a master of corny jokes became a city mayor in Taiwan.
He was later recalled for making too many corny jokes.

3. PRO360
https://www.pro360.com.tw
What?! You've never heard of PRO360?
Well, there's a saying among us employees: Thumbtack is our Figma.

4. TW Reporter
https://www.twreporter.org/
The non-profit digital news outlet in Taiwan, renowned for long-form investigative journalism.`;

const URLS = [
  "https://tw.yahoo.com",
  "https://tw.buy.yahoo.com",
  "https://hanrecall.pts.org.tw/",
  "https://www.pro360.com.tw",
  "https://www.twreporter.org/",
];

const FG = "rgb(211, 233, 230)";
const ACCENT = "rgb(84, 220, 192)";

const VIEWPORTS = {
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
} as const;

const meta = {
  title: "cmd-projects/Projects",
  render: () => <Terminal />,
  parameters: { viewport: { options: VIEWPORTS } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- helpers ----------

async function setup(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const input = (await canvas.findByRole("textbox", {
    name: "Terminal input",
  })) as HTMLInputElement;
  return { canvas, input };
}

async function run(input: HTMLInputElement, text: string) {
  await userEvent.clear(input);
  if (text) await userEvent.type(input, text);
  await userEvent.keyboard("{Enter}");
}

const text = (el: HTMLElement) =>
  el.innerText
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");

// ---------- stories ----------

export const TC2: Story = {
  name: "TC-CMD-PROJECTS-2: `projects` prints exactly the PRD's text, every time",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "projects");
    await run(input, "projects");
    const all = canvas.getAllByTestId("projects");
    await expect(all).toHaveLength(2);
    for (const output of all) await expect(text(output)).toBe(PRD_OUTPUT);
  },
};

export const TC3: Story = {
  name: "TC-CMD-PROJECTS-3: titles are accent and not underlined; descriptions are fg",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "projects");
    const projects = within(canvas.getByTestId("projects"));
    const titles = projects.getAllByTestId("project-title");
    await expect(titles.map((t) => t.textContent)).toEqual([
      "1. Yahoo News and E-commerce",
      "2. Recall Election: Live Results and News",
      "3. PRO360",
      "4. TW Reporter",
    ]);
    for (const title of titles) {
      const style = getComputedStyle(title);
      await expect(style.color).toBe(ACCENT);
      await expect(style.textDecorationLine).toBe("none");
    }
    await expect(
      getComputedStyle(projects.getByText("Yup, I know, once.")).color,
    ).toBe(FG);
  },
};

export const TC4: Story = {
  name: "TC-CMD-PROJECTS-4: URLs are underlined accent links that open in a new tab",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "projects");
    const links = within(canvas.getByTestId("projects")).getAllByRole("link");
    await expect(links.map((l) => l.textContent)).toEqual(URLS);
    await expect(links.map((l) => l.getAttribute("href"))).toEqual(URLS);
    for (const link of links) {
      await expect(link).toHaveAccessibleName(link.getAttribute("href")!);
      await expect(link.getAttribute("target")).toBe("_blank");
      await expect(link.getAttribute("rel")).toContain("noopener");
      const style = getComputedStyle(link);
      await expect(style.color).toBe(ACCENT);
      await expect(style.textDecorationLine).toBe("underline");
    }
  },
};

export const TC5: Story = {
  name: "TC-CMD-PROJECTS-5: at 375px long lines wrap without horizontal scroll",
  globals: { viewport: { value: "w375", isRotated: false } },
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    await run(input, "projects");
    const projects = within(canvas.getByTestId("projects"));
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
    const line = projects.getByText(/^The non-profit digital news outlet/);
    const rows = Math.round(
      line.getBoundingClientRect().height /
        parseFloat(getComputedStyle(line).lineHeight),
    );
    await expect(rows).toBeGreaterThanOrEqual(2);
  },
};
