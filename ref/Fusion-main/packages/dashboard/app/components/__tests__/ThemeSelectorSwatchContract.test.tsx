import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeSelector } from "../ThemeSelector";
import { loadAllAppCss } from "../../test/cssFixture";

function renderThemeSelector() {
  render(
    <ThemeSelector
      themeMode="dark"
      colorTheme="default"
      onThemeModeChange={vi.fn()}
      onColorThemeChange={vi.fn()}
    />,
  );
}

describe("ThemeSelector swatch preview contract", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
    const style = document.createElement("style");
    style.setAttribute("data-testid", "theme-swatch-contract-css");
    style.textContent = loadAllAppCss();
    document.head.appendChild(style);
  });

  afterEach(() => {
    document
      .querySelectorAll('style[data-testid="theme-swatch-contract-css"]')
      .forEach((node) => node.remove());
    document.documentElement.removeAttribute("data-theme");
  });

  it.each([
    ["dark", "Ocean theme"],
    ["dark", "Sunset theme"],
    ["dark", "Mono theme"],
    ["dark", "Neon City theme"],
    ["light", "Ocean theme"],
    ["light", "Sunset theme"],
    ["light", "Mono theme"],
    ["light", "Neon City theme"],
  ] as const)(
    "shows diverse accent samples for %s mode / %s",
    (mode, themeLabel) => {
      document.documentElement.setAttribute("data-theme", mode);
      renderThemeSelector();

      const swatch = screen
        .getByLabelText(themeLabel)
        .querySelector(".theme-option-swatch");
      expect(swatch).toBeTruthy();

      const samples = Array.from(
        swatch!.querySelectorAll<HTMLElement>(".theme-option-swatch-sample"),
      );
      expect(samples).toHaveLength(4);

      const swatchStyle = window.getComputedStyle(swatch as HTMLElement);
      const sampleOne = swatchStyle.getPropertyValue("--swatch-sample-1").trim();
      const sampleTwo = swatchStyle.getPropertyValue("--swatch-sample-2").trim();
      const sampleThree = swatchStyle.getPropertyValue("--swatch-sample-3").trim();
      const sampleFour = swatchStyle.getPropertyValue("--swatch-sample-4").trim();

      expect(sampleThree).not.toBe(sampleOne);
      expect(sampleThree).not.toBe(sampleTwo);
      expect(sampleFour).not.toBe(sampleOne);
      expect(sampleFour).not.toBe(sampleTwo);
    },
  );

  it("does not generate sample 3/4 in shared .theme-option-swatch block", () => {
    const css = loadAllAppCss();
    const sharedSwatchBlock = css.match(/\.theme-option-swatch\s*\{[^}]*\}/);
    expect(sharedSwatchBlock).toBeTruthy();

    expect(sharedSwatchBlock![0]).not.toMatch(/--swatch-sample-3\s*:/);
    expect(sharedSwatchBlock![0]).not.toMatch(/--swatch-sample-4\s*:/);
    expect(sharedSwatchBlock![0]).not.toMatch(
      /color-mix\([^)]*var\(--swatch-sample-1\)[^)]*var\(--swatch-sample-2\)/,
    );
  });

  it("defines all four swatch samples in every dark and light per-theme swatch block", () => {
    const css = loadAllAppCss();

    const darkBlocks = Array.from(
      css.matchAll(/(^|\n)\.theme-swatch-[a-z0-9\-]+\s*\{[^}]*\}/g),
      (match) => match[0],
    );
    const lightBlocks = Array.from(
      css.matchAll(
        /(^|\n)\[data-theme="light"\]\s+\.theme-swatch-[a-z0-9\-]+\s*\{[^}]*\}/g,
      ),
      (match) => match[0],
    );

    expect(darkBlocks.length).toBeGreaterThan(0);
    expect(lightBlocks.length).toBeGreaterThan(0);

    const assertAllSamplesDefined = (block: string) => {
      expect(block).toMatch(/--swatch-sample-1\s*:/);
      expect(block).toMatch(/--swatch-sample-2\s*:/);
      expect(block).toMatch(/--swatch-sample-3\s*:/);
      expect(block).toMatch(/--swatch-sample-4\s*:/);
    };

    darkBlocks.forEach(assertAllSamplesDefined);
    lightBlocks.forEach(assertAllSamplesDefined);
  });
});
