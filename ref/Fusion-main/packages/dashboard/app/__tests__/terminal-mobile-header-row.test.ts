import { describe, it, expect } from "vitest";
import { loadAllAppCss } from "../test/cssFixture";

const css = loadAllAppCss();
const terminalSectionStart = css.indexOf("Terminal Modal Mobile Responsive");
const terminalMobileSection =
  terminalSectionStart >= 0 ? css.slice(terminalSectionStart) : "";

function findRuleBody(selector: RegExp): string {
  const match = terminalMobileSection.match(
    new RegExp(selector.source + /\s*\{([^}]*)\}/.source),
  );
  return match?.[1] ?? "";
}

describe("terminal mobile header row CSS contract", () => {
  it("keeps the mobile terminal header on one row", () => {
    const ruleBody = findRuleBody(/\.terminal-header/);

    expect(ruleBody).toContain("flex-wrap: nowrap");
    expect(ruleBody).toContain("overflow: hidden");
  });

  it("keeps tabs flexible instead of forcing them onto a full-width row", () => {
    const ruleBody = findRuleBody(/\.terminal-tabs/);

    expect(ruleBody).toContain("flex: 1 1 auto");
    expect(ruleBody).toContain("min-width: 0");
    expect(ruleBody).not.toContain("flex: 1 1 100%");
    expect(ruleBody).not.toContain("min-width: 100%");
  });

  it("keeps the action cluster on the same row without a second-row divider", () => {
    const ruleBody = findRuleBody(/\.terminal-actions/);

    expect(ruleBody).toContain("flex: 0 0 auto");
    expect(ruleBody).toContain("border-top: none");
    expect(ruleBody).not.toContain("flex: 1 1 100%");
  });

  it("defines dedicated spacing between the clear and shortcuts buttons", () => {
    const ruleBody = css.match(/\.terminal-clear-btn--shortcut\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(ruleBody).toContain("margin-left: var(--space-xs)");
  });
});
