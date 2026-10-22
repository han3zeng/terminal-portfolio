import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

// Throwaway: proves Storybook tests run, Tailwind styles load, and the next/font variable
// from .storybook/preview.tsx reaches stories. Delete once real stories exist.
const meta = {
  title: "Smoke",
  render: () => <p className="p-4 font-mono">strangerfornow@han3zeng:~$</p>,
} satisfies Meta;

export default meta;

export const TailwindLoaded: StoryObj<typeof meta> = {
  play: async ({ canvas }) => {
    const prompt = canvas.getByText("strangerfornow@han3zeng:~$");
    await expect(getComputedStyle(prompt).padding).toBe("16px");
  },
};

export const FontLoaded: StoryObj<typeof meta> = {
  play: async ({ canvas }) => {
    const prompt = canvas.getByText("strangerfornow@han3zeng:~$");
    await expect(getComputedStyle(prompt).fontFamily).toMatch(/JetBrains Mono/);
  },
};
