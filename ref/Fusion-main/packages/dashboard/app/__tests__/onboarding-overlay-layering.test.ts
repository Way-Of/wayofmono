import { describe, expect, it } from "vitest";
import { loadAllAppCssBaseOnly } from "../test/cssFixture";

const css = loadAllAppCssBaseOnly();

function getSelectorBlock(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "m");
  const match = css.match(pattern);
  expect(match, `Expected ${selector} CSS block to exist`).not.toBeNull();
  return match?.[1] ?? "";
}

function getSelectorZIndex(selector: string): number {
  const block = getSelectorBlock(selector);
  const match = block.match(/z-index:\s*(\d+)/);
  expect(match, `Expected ${selector} to define a z-index`).not.toBeNull();
  return Number(match?.[1]);
}

describe("onboarding overlay layering contract (FN-2397)", () => {
  it("keeps modal overlays above sticky top banners", () => {
    const modalOverlayZ = getSelectorZIndex(".modal-overlay");
    const sessionBannerZ = getSelectorZIndex(".session-notification-banner");

    expect(modalOverlayZ).toBeGreaterThan(sessionBannerZ);
  });

  it("keeps the onboarding resume banner in normal document flow", () => {
    const onboardingResumeBlock = getSelectorBlock(".onboarding-resume-card");

    expect(onboardingResumeBlock).not.toMatch(/position:\s*sticky/);
    expect(onboardingResumeBlock).not.toMatch(/top:\s*0/);
  });
});
