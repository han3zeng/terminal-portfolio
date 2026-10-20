import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Terminal } from "@/terminal/Terminal";

import { GRAPHIC, NARROW_BANNER, TEXT_LINES, WIDE_BANNER } from "./art";
import { Welcome } from "./Welcome";

// Test hooks (cmd-welcome spec): welcome, welcome-description, welcome-banner-wide,
// welcome-banner-narrow, welcome-graphic. Stories render the real Terminal, whose
// first entry is `welcome`, unless noted.

const VIEWPORTS = {
  w320: {
    name: "320px",
    styles: { width: "320px", height: "800px" },
    type: "mobile",
  },
  w375: {
    name: "375px",
    styles: { width: "375px", height: "800px" },
    type: "mobile",
  },
  w767: {
    name: "767px",
    styles: { width: "767px", height: "900px" },
    type: "tablet",
  },
  w768: {
    name: "768px",
    styles: { width: "768px", height: "900px" },
    type: "tablet",
  },
  w1024: {
    name: "1024px",
    styles: { width: "1024px", height: "800px" },
    type: "desktop",
  },
  w1280: {
    name: "1280px",
    styles: { width: "1280px", height: "800px" },
    type: "desktop",
  },
} as const;

const viewport = (value: keyof typeof VIEWPORTS) => ({
  viewport: { value, isRotated: false },
});

const meta = {
  title: "cmd-welcome/Welcome",
  render: () => <Terminal />,
  parameters: { layout: "fullscreen", viewport: { options: VIEWPORTS } },
  globals: viewport("w1280"),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DESCRIPTION_TEXT = `${WIDE_BANNER}\n\n\n${TEXT_LINES.join("\n")}`;

// ---------- helpers ----------

async function setup(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const input = (await canvas.findByRole("textbox", {
    name: "Terminal input",
  })) as HTMLInputElement;
  return { canvas, input };
}

type Canvas = ReturnType<typeof within>;

const welcomes = (canvas: Canvas) => canvas.getAllByTestId("welcome");
const part = (root: HTMLElement, testId: string) =>
  within(root).getByTestId(testId);
const box = (el: Element) => el.getBoundingClientRect();
const trimLines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");

// The graphic's natural width ÷ height: GRAPHIC in an unscaled <pre> with the same font.
function naturalRatio(host: HTMLElement): number {
  const pre = document.createElement("pre");
  pre.textContent = GRAPHIC;
  Object.assign(pre.style, {
    position: "absolute",
    visibility: "hidden",
    margin: "0",
    lineHeight: "1.5",
    whiteSpace: "pre",
  });
  host.appendChild(pre);
  const { width, height } = pre.getBoundingClientRect();
  pre.remove();
  return width / height;
}

// One `ch` of the terminal font, in px.
function chWidth(host: HTMLElement): number {
  const probe = document.createElement("span");
  Object.assign(probe.style, {
    position: "absolute",
    visibility: "hidden",
    width: "1ch",
  });
  host.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
}

async function expectGraphicMatchesDescription(welcome: HTMLElement) {
  const ratio = naturalRatio(welcome);
  await waitFor(() => {
    const description = box(part(welcome, "welcome-description"));
    const graphic = box(part(welcome, "welcome-graphic"));
    expect(Math.abs(graphic.height - description.height)).toBeLessThanOrEqual(
      2,
    );
    expect(
      Math.abs(graphic.width / graphic.height / ratio - 1),
    ).toBeLessThanOrEqual(0.02);
  });
}

// ---------- stories ----------

export const TC3: Story = {
  name: "TC-CMD-WELCOME-3: the first entry shows the desktop welcome, and `welcome` repeats it",
  play: async ({ canvasElement }) => {
    const { canvas, input } = await setup(canvasElement);
    const [first] = welcomes(canvas);
    await expect(trimLines(part(first, "welcome-description").innerText)).toBe(
      DESCRIPTION_TEXT,
    );
    await expect(part(first, "welcome-banner-wide")).toBeVisible();
    await expect(part(first, "welcome-banner-narrow")).not.toBeVisible();
    await expect(part(first, "welcome-graphic")).toBeVisible();

    await run(input, "welcome");
    const all = welcomes(canvas);
    await expect(all).toHaveLength(2);
    await expect(all[1].textContent).toBe(first.textContent);
  },
};

function sideBySidePlay(): Story["play"] {
  return async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    const description = box(part(welcome, "welcome-description"));
    const graphic = box(part(welcome, "welcome-graphic"));
    await expect(graphic.left).toBeGreaterThan(description.right - 1);
    await expect(Math.abs(graphic.top - description.top)).toBeLessThanOrEqual(
      1,
    );
    await expect(
      Math.abs(graphic.left - description.right - 2 * chWidth(welcome)),
    ).toBeLessThanOrEqual(1);
  };
}

export const TC4At1280: Story = {
  name: "TC-CMD-WELCOME-4: desktop puts the graphic right of the description, top-aligned, 2ch apart (1280px)",
  play: sideBySidePlay(),
};

export const TC4At768: Story = {
  name: "TC-CMD-WELCOME-4: desktop puts the graphic right of the description, top-aligned, 2ch apart (768px)",
  globals: viewport("w768"),
  play: sideBySidePlay(),
};

function narrowPlay(): Story["play"] {
  return async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    await expect(part(welcome, "welcome-banner-narrow")).toBeVisible();
    await expect(part(welcome, "welcome-banner-wide")).not.toBeVisible();
    await expect(part(welcome, "welcome-graphic")).not.toBeVisible();
    const description = part(welcome, "welcome-description");
    await expect(description).toHaveTextContent(TEXT_LINES[0]);
    await expect(description).toHaveTextContent(TEXT_LINES[1]);
    await expect(
      trimLines(part(welcome, "welcome-banner-narrow").innerText),
    ).toBe(NARROW_BANNER);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
  };
}

export const TC5At375: Story = {
  name: "TC-CMD-WELCOME-5: narrow screens show the narrow banner and no graphic (375px)",
  globals: viewport("w375"),
  play: narrowPlay(),
};

export const TC5At767: Story = {
  name: "TC-CMD-WELCOME-5: narrow screens show the narrow banner and no graphic (767px)",
  globals: viewport("w767"),
  play: narrowPlay(),
};

export const TC5At320: Story = {
  name: "TC-CMD-WELCOME-5: narrow screens show the narrow banner and no graphic (320px)",
  globals: viewport("w320"),
  play: narrowPlay(),
};

export const TC6: Story = {
  name: "TC-CMD-WELCOME-6: the banner is primary; text and graphic are fg",
  play: async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    const color = (testId: string) =>
      getComputedStyle(part(welcome, testId)).color;
    await expect(color("welcome-banner-wide")).toBe("rgb(143, 255, 224)");
    await expect(color("welcome-graphic")).toBe("rgb(211, 233, 230)");
    const text = within(part(welcome, "welcome-description")).getByText(
      TEXT_LINES[0],
      { exact: false },
    );
    await expect(getComputedStyle(text).color).toBe("rgb(211, 233, 230)");
  },
};

function scalePlay(): Story["play"] {
  return async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    await expectGraphicMatchesDescription(welcomes(canvas)[0]);
  };
}

export const TC7At1280: Story = {
  name: "TC-CMD-WELCOME-7: the graphic has the description's height and its own shape (1280px)",
  play: scalePlay(),
};

export const TC7At1024: Story = {
  name: "TC-CMD-WELCOME-7: the graphic has the description's height and its own shape (1024px)",
  globals: viewport("w1024"),
  play: scalePlay(),
};

export const TC7At768: Story = {
  name: "TC-CMD-WELCOME-7: the graphic has the description's height and its own shape (768px)",
  globals: viewport("w768"),
  play: scalePlay(),
};

export const TC8: Story = {
  name: "TC-CMD-WELCOME-8: the graphic follows the description when the column narrows",
  render: () => (
    <div data-testid="container" style={{ width: 1280 }}>
      <Welcome args={[]} history={["welcome"]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const welcome = await canvas.findByTestId("welcome");
    await expectGraphicMatchesDescription(welcome);
    const before = box(part(welcome, "welcome-description")).height;

    canvas.getByTestId("container").style.width = "800px";
    await waitFor(() =>
      expect(box(part(welcome, "welcome-description")).height).toBeGreaterThan(
        before + 1,
      ),
    );
    await expectGraphicMatchesDescription(welcome);
  },
};

export const TC9At1280: Story = {
  name: "TC-CMD-WELCOME-9: the banner is one image named Han Zeng; the graphic is hidden from screen readers (1280px)",
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    const images = within(welcome).getAllByRole("img", { name: "Han Zeng" });
    await expect(images).toHaveLength(1);
    await expect(images[0]).toBe(part(welcome, "welcome-banner-wide"));
    await expect(part(welcome, "welcome-graphic")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
};

export const TC9At375: Story = {
  name: "TC-CMD-WELCOME-9: the banner is one image named Han Zeng; the graphic is hidden from screen readers (375px)",
  globals: viewport("w375"),
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement }) => {
    const { canvas } = await setup(canvasElement);
    const [welcome] = welcomes(canvas);
    const images = within(welcome).getAllByRole("img", { name: "Han Zeng" });
    await expect(images).toHaveLength(1);
    await expect(images[0]).toBe(part(welcome, "welcome-banner-narrow"));
  },
};

async function run(input: HTMLInputElement, text: string) {
  await userEvent.clear(input);
  if (text) await userEvent.type(input, text);
  await userEvent.keyboard("{Enter}");
}
