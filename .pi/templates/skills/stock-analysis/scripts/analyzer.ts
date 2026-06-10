/**
 * analyzer.ts LLM/VLM
 * +
 */

import { StockData, AnalysisResult, OutputFormat, Market, Verdict, PositionInfo } from "./types";
import { validateStockData } from "./dataFetcher";
import { analyzeDividend, formatDividendMarkdown } from "./dividend";
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const MARKET_LABEL: Record<Market, string> = { CN: "A", HK: "", US: "" };

// ── Prompt ─────────────────────────────────────────

function buildDashboardPrompt(
 data: StockData,
 position: PositionInfo | undefined,
 warnings: string[]
): string {
 const warningBlock = warnings.length > 0
 ? `⚠️ \n${warnings.map((w) => `- ${w}`).join("\n")}\n\n`
 : "";

 const positionBlock = position
 ? position.status === "holding"
 ? ` ${position.cost ?? ""} ${position.shares ? `${position.shares} ` : ""}`
 : ``
 : ``;

 return `${warningBlock}${positionBlock}


\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`



---

## · {}({}) · {}

---

### 📰
**💭 **
**📊 ** PE/ROE/""
**🚨 **
- 1
- 2
**✨ **
- 1
- 2
**📢 ** 1

---

### 📌
**[emoji] / / / **>5%
**💬 **
**⏰ ** / /


- **🆕 **
- **💼 ** ///${position?.status === "holding" && position.cost ? "" : ""}

---

### 📈
""

---

### 📊

****
 | | MA5MA10MA20(BIAS20)RSI
 + xx/100

****
 | | ROEPEPB
""

****A/
- %
- | |

---

### 🎯

| | | |
|---------|------|------|
| 🎯 | xxx | |
| 🔵 | xxx | |
| 🛑 | xxx | |
| 🎊 | xxx | |

**💰 ** x
****
****

---

### ✅
- ✅/⚠️/❌
- ✅/⚠️/❌ <5%
- ✅/⚠️/❌
- ✅/⚠️/❌
- ✅/⚠️/❌
- ✅/⚠️/❌

****

---
**`;
}

// ── PromptPDF/Word──────────────────────────────

function buildReportPrompt(data: StockData, position: PositionInfo | undefined): string {
 const positionBlock = position?.status === "holding"
 ? `${position.cost ?? ""}`
 : "";

 return `${positionBlock}


\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`



{}({}) · {} · {}

////
////
//
//
2-3

AI`;
}

// ── ──────────────────────────────────────────────

function extractVerdict(text: string): Verdict {
 const patterns = [
 /[:]\s*[💚🟢🟡🔴⚪]?\s*(|||)/,
 /[:]\s*[💚🟢🟡🔴⚪]?\s*(|||)/,
 /\*\*(|||)\*\*/,
 ];
 for (const p of patterns) {
 const m = text.match(p);
 if (m) return m[1] as Verdict;
 }
 return "";
}

// ── ──────────────────────────────────────────────

export async function analyzeStock(
 data: StockData,
 outputFormat: OutputFormat = "markdown",
 position?: PositionInfo,
 includeDividend = false
): Promise<AnalysisResult> {
 const { valid, warnings } = validateStockData(data);
 const name = data.name ?? data.code;

 if (!valid) {
 return {
 code: data.code, market: data.market, name,
 verdict: "",
 analysis: `## ⚠️ \n\n${data.code} ${data.error ?? ""}`,
 warnings, outputFormat,
 generatedAt: new Date().toISOString(),
 };
 }

 const userPrompt = outputFormat === "markdown"
 ? buildDashboardPrompt(data, position, warnings)
 : buildReportPrompt(data, position);

 let analysisText = "⚠️ LLM ";
 try {
 const systemPrompt = `${MARKET_LABEL[data.market]}"">5%///"`;
 const { stdout } = await execAsync(`ollama run llama3.1 "${systemPrompt} ${userPrompt.replace(/"/g, '\\"')}"`);
 analysisText = stdout.trim() || analysisText;
 } catch (err: any) {
 analysisText = `## ⚠️ \n\nLLM ${err.message}`;
 }

 //
 if (includeDividend && data.market === "US" && outputFormat === "markdown") {
 try {
 const dividend = await analyzeDividend(data.code);
 const dividendMd = formatDividendMarkdown(dividend);
 analysisText += `\n\n${dividendMd}`;
 } catch {}
 }

  return {
 code: data.code, market: data.market, name,
 verdict: extractVerdict(analysisText),
 analysis: analysisText,
 warnings, outputFormat,
 generatedAt: new Date().toISOString(),
 };
}

// ── ──────────────────────────────────────────────

export async function analyzeMultipleStocks(
 stockDataList: StockData[],
 outputFormat: OutputFormat = "markdown",
 positions?: Record<string, PositionInfo>,
 includeDividend = false
): Promise<AnalysisResult[]> {
 const results: AnalysisResult[] = [];
 for (const data of stockDataList) {
 const position = positions?.[data.code];
 results.push(await analyzeStock(data, outputFormat, position, includeDividend));
 }
 return results;
}

// ── KVLM──────────────────────────────────────

export async function analyzeChartImage(
 imageUrlOrBase64: string,
 stockCode: string,
 isBase64 = false
): Promise<string> {
 try {
 let imagePath = imageUrlOrBase64;
 if (isBase64) {
 const fs = await import('fs');
 const tmpPath = `/tmp/chart_${Date.now()}.png`;
 fs.writeFileSync(tmpPath, Buffer.from(imageUrlOrBase64, 'base64'));
 imagePath = tmpPath;
 }
 const { stdout } = await execAsync(`ollama run llava "Please analyze this K-line chart for ${stockCode}. 1. K-line pattern 2. Support/resistance 3. Trend 4. Signals 5. " --image ${imagePath}`);
 return stdout.trim() || "⚠️ VLM ";
 } catch (err: any) {
 return `K${err.message}`;
 }
}
