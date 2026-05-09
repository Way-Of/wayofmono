import fs from "node:fs";
import { loadAllAppCss } from "../../test/cssFixture";
import path from "node:path";
import { describe, expect, it } from "vitest";


function getMissionMobileSection(css: string): string {
  const start = css.indexOf("/* ================================================================\n   Responsive — Mission Manager on mobile (≤768px)");
  expect(start).toBeGreaterThan(-1);

  // After CSS extraction, the Workflow Results block lives in
  // WorkflowResultsTab.css; the mission mobile section now ends just before
  // the appended light-theme overrides at the end of MissionManager.css.
  const end = css.indexOf("/* Light theme overrides", start);
  expect(end).toBeGreaterThan(start);

  return css.slice(start, end);
}

describe("MissionManager mobile styles", () => {
  it("adds responsive tab and activity layout rules", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);

    expect(section).toContain(".mission-detail__tabs {");
    expect(section).toContain("overflow-x: auto;");
    expect(section).toContain(".mission-detail__activity-controls {");
    expect(section).toContain("flex-direction: column;");
    expect(section).toContain(".mission-detail__activity-filter,");
    expect(section).toContain(".mission-detail__activity-filter select {");
    expect(section).toContain("width: 100%;");
  });

  it("adds mobile overflow protection for activity event content", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);

    expect(section).toContain(".mission-events {");
    expect(section).toContain("max-height: min(46vh, 360px);");
    expect(section).toContain(".mission-event__description,");
    expect(section).toContain("overflow-wrap: anywhere;");
    expect(section).toContain("word-break: break-word;");
  });

  it("hides desktop split layout on mobile", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);

    expect(section).toContain(".mission-manager__split {");
    expect(section).toContain("display: none;");
  });

  it("restores stacked body on mobile", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);

    expect(section).toContain(".mission-manager__body--stacked {");
    expect(section).toContain("display: block;");
  });

  it("keeps the mobile top mission CTA full-width and token-driven", () => {
    const css = loadAllAppCss();

    const topActionRule = css.match(/\.mission-list__top-action\s*\{[^}]*\}/)?.[0];
    expect(topActionRule).toContain("display: flex;");

    const topCtaRule = css.match(/\.mission-list__primary-cta\s*\{[^}]*\}/)?.[0];
    expect(topCtaRule).toContain("width: 100%;");
    expect(topCtaRule).toContain("justify-content: center;");
    expect(topCtaRule).toContain("gap: var(--space-sm);");

    const taskCreateRule = css.match(/\.btn-task-create\s*\{[^}]*\}/)?.[0];
    expect(taskCreateRule).toContain("background: var(--cta-bg);");
    expect(taskCreateRule).toContain("border-color: var(--cta-border);");
    expect(taskCreateRule).toContain("color: var(--cta-text);");
  });

  it("hides back button on desktop and restores it on mobile", () => {
    const css = loadAllAppCss();
    const desktopRule = css.match(/\.mission-manager--desktop \.mission-manager__back-btn\s*\{[^}]*\}/)?.[0];
    expect(desktopRule).toContain("display: none;");

    const section = getMissionMobileSection(css);
    const mobileRule = section.match(/\.mission-manager--desktop \.mission-manager__back-btn\s*\{[^}]*\}/)?.[0];
    expect(mobileRule).toContain("display: inline-flex;");
  });

  it("keeps desktop defaults and mobile overrides for header title spans", () => {
    const css = loadAllAppCss();
    const desktopMobileSpanBlock = css.match(/\.mission-manager__title-text--mobile\s*\{[^}]*\}/)?.[0];
    const desktopDesktopSpanBlock = css.match(/\.mission-manager__title-text--desktop\s*\{[^}]*\}/)?.[0];
    expect(desktopMobileSpanBlock).toContain("display: none");
    expect(desktopDesktopSpanBlock).toContain("display: inline");

    const section = getMissionMobileSection(css);
    const mobileBlock = section.match(/\.mission-manager__title-text--mobile\s*\{[^}]*\}/)?.[0];
    const desktopBlock = section.match(/\.mission-manager__title-text--desktop\s*\{[^}]*\}/)?.[0];
    expect(mobileBlock).toContain("display: inline");
    expect(desktopBlock).toContain("display: none");
  });
});

describe("desktop two-panel split CSS", () => {
  it("defines sidebar with fixed width, border, and scroll", () => {
    const css = loadAllAppCss();
    expect(css).toContain(".mission-manager__sidebar {");
    // Sidebar width uses token-based calc instead of hardcoded px
    expect(css).toContain("flex-shrink: 0;");
    expect(css).toContain("border-right");
    expect(css).toContain("var(--border)");
  });

  it("defines detail pane with flex: 1 and overflow", () => {
    const css = loadAllAppCss();
    expect(css).toContain(".mission-manager__detail-pane {");
    expect(css).toContain("flex: 1;");
    expect(css).toContain("overflow-y: auto;");
  });

  it("hides back button on desktop", () => {
    const css = loadAllAppCss();
    expect(css).toContain(".mission-manager--desktop .mission-manager__back-btn {");
    expect(css).toContain("display: none;");
  });

  it("toggles header title variants on desktop", () => {
    const css = loadAllAppCss();
    expect(css).toContain(".mission-manager__title-text--desktop {");
    expect(css).toContain(".mission-manager__title-text--mobile {");
  });

  it("defines sidebar list with overflow scroll", () => {
    const css = loadAllAppCss();
    expect(css).toContain(".mission-manager__sidebar-list {");
    expect(css).toContain("overflow-y: auto;");
  });

  it("defines split container as flex row", () => {
    const css = loadAllAppCss();
    expect(css).toContain(".mission-manager__split {");
    expect(css).toContain("flex-direction: row;");
  });

  it("defines empty detail pane placeholder", () => {
    const css = loadAllAppCss();
    expect(css).toContain(".mission-manager__detail-pane-empty {");
    expect(css).toContain("var(--text-muted)");
  });
});

describe("mobile split reversal CSS", () => {
  it("hides desktop split on mobile", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);
    expect(section).toContain(".mission-manager__split {");
    expect(section).toContain("display: none;");
  });

  it("restores stacked body on mobile", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);
    expect(section).toContain(".mission-manager__body--stacked {");
    expect(section).toContain("display: block;");
  });

  it("restores back button on mobile", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);
    const mobileRule = section.match(/\.mission-manager--desktop \.mission-manager__back-btn\s*\{[^}]*\}/)?.[0];
    expect(mobileRule).toContain("display: inline-flex;");
  });

  it("restores dynamic title on mobile", () => {
    const css = loadAllAppCss();
    const section = getMissionMobileSection(css);
    const mobileBlock = section.match(/\.mission-manager__title-text--mobile\s*\{[^}]*\}/)?.[0];
    const desktopBlock = section.match(/\.mission-manager__title-text--desktop\s*\{[^}]*\}/)?.[0];
    expect(mobileBlock).toContain("display: inline");
    expect(desktopBlock).toContain("display: none");
  });
});
