import { describe, expect, it } from "vitest";
import { loadAllAppCss } from "../test/cssFixture";

function extractMobileMediaBlocks(content: string): string {
  const blocks: string[] = [];
  const regex = /@media\s*\(\s*max-width:\s*768px\s*\)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const startIdx = match.index + match[0].length;
    let braceCount = 1;
    let endIdx = startIdx;
    while (braceCount > 0 && endIdx < content.length) {
      if (content[endIdx] === "{") braceCount += 1;
      if (content[endIdx] === "}") braceCount -= 1;
      endIdx += 1;
    }
    if (braceCount === 0) {
      blocks.push(content.slice(startIdx, endIdx - 1));
    }
  }

  return blocks.join("\n");
}

describe("chat tool-call mobile layout css", () => {
  const css = loadAllAppCss();
  const mobileCss = extractMobileMediaBlocks(css);

  it("keeps full-chat grouped and single tool-call summaries on one row in mobile media blocks", () => {
    const groupedSummaryRule = mobileCss.match(/\.chat-tool-calls-group-summary,\s*\n\s*\.chat-tool-call summary\s*\{[^}]*\}/m)?.[0] ?? "";
    expect(groupedSummaryRule).toMatch(/flex-wrap:\s*nowrap/);
    expect(groupedSummaryRule).toMatch(/flex-direction:\s*row/);
    expect(groupedSummaryRule).toMatch(/align-items:\s*center/);

    const nowrapRule = mobileCss.match(/\.chat-tool-calls-names,\s*\n\s*\.chat-tool-call-name,\s*\n\s*\.chat-tool-call-status-text,\s*\n\s*\.chat-tool-calls-group-status,\s*\n\s*\.chat-tool-calls-count\s*\{[^}]*\}/m)?.[0] ?? "";
    expect(nowrapRule).toMatch(/white-space:\s*nowrap/);

    const allMobileSummaryRules = [...mobileCss.matchAll(/\.chat-tool-calls-group-summary\s*\{[^}]*\}/g)].map((m) => m[0]);
    expect(allMobileSummaryRules.length).toBeGreaterThan(0);
    expect(allMobileSummaryRules.every((rule) => !/flex-direction:\s*column/.test(rule))).toBe(true);
  });
});
