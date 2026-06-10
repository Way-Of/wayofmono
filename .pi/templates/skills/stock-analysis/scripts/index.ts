/**
 * index.ts Skill
 *
 *
 * run()
 * runDividend()
 * runRumorScan()
 * runWatchlistAdd()
 * runWatchlistList()
 * runWatchlistCheck()
 * runWatchlistRemove()
 * runChartAnalysis() K
 */

import { fetchMultipleStocks, fetchMarketOverview, fetchGlobalMacro } from "./dataFetcher";
import { analyzeMultipleStocks, analyzeChartImage } from "./analyzer";
import { analyzeDividends, formatDividendMarkdown } from "./dividend";
import { scanRumors, formatRumorMarkdown } from "./rumorScanner";
import {
 addToWatchlist, removeFromWatchlist,
 listWatchlist, checkAlerts,
 formatWatchlistMarkdown, formatAlertsMarkdown,
} from "./watchlist";
import { SkillInput, StockInput, OutputFormat, AnalysisResult, PositionInfo, Verdict } from "./types";
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// ── ──────────────────────────────────────────────

function parseInput(raw: unknown): {
 stocks: string[];
 positions: Record<string, PositionInfo>;
 outputFormat: OutputFormat;
 mode: "full" | "quote";
 includeMarketReview: boolean;
 includeGlobalMacro: boolean;
 includeDividend: boolean;
} {
 const stocks: string[] = [];
 const positions: Record<string, PositionInfo> = {};
 let outputFormat: OutputFormat = "markdown";
 let mode: "full" | "quote" = "full";
 let includeMarketReview = false;
 let includeGlobalMacro = true;
 let includeDividend = false;

 if (typeof raw === "string") {
 raw.split(/[,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean).forEach((c) => stocks.push(c));
 } else if (typeof raw === "object" && raw !== null) {
 const input = raw as any;
 const rawStocks: (string | StockInput)[] = input.stocks ?? (input.stock ? [input.stock] : []);
 for (const s of rawStocks) {
 if (typeof s === "string") stocks.push(s.trim().toUpperCase());
 else if (s.code) {
 const code = s.code.trim().toUpperCase();
 stocks.push(code);
 if (s.position) positions[code] = s.position;
 }
 }
 outputFormat = input.outputFormat ?? input.format ?? "markdown";
 mode = input.mode ?? "full";
 includeMarketReview = input.includeMarketReview ?? false;
 includeGlobalMacro = input.includeGlobalMacro ?? true;
 includeDividend = input.includeDividend ?? false;
 }

 return { stocks, positions, outputFormat, mode, includeMarketReview, includeGlobalMacro, includeDividend };
}

function log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`); }

// ── ──────────────────────────────────────────────

function buildFullReport(
 results: AnalysisResult[],
 globalMacro?: string,
 marketOverview?: string
): string {
 const date = new Date().toLocaleDateString("zh-CN");
 const buy = results.filter((r) => ["", ""].includes(r.verdict)).length;
 const watch = results.filter((r) => r.verdict === "").length;
 const sell = results.filter((r) => r.verdict === "").length;

 let output = `# 📈
**** ${date}** ${results.length} **🟢/ ${buy}🟡 ${watch}🔴 ${sell}

`;
 if (globalMacro) output += `---\n\n## 🌍 \n\n${globalMacro}\n\n`;
 if (marketOverview) output += `---\n\n## 🎯 \n\n${marketOverview}\n\n`;
 output += `---\n\n## 📊 \n\n`;
 output += results.map((r) => {
 const warn = r.warnings.length > 0 ? `\n> ⚠️ **** ${r.warnings.join(" | ")}\n` : "";
 return `${warn}\n${r.analysis}\n\n---\n`;
 }).join("\n");

 return output;
}

// ── pdf/docx skill ───────────────────────────────────

async function exportToFormat(content: string, format: "pdf" | "word"): Promise<string> {
 const isPDF = format === "pdf";
 try {
 const { stdout } = await execAsync(`ollama run llama3.1 "${isPDF ? `PDF A4` : `Word (.docx)`} \\n\\n${content.replace(/"/g, '\\"')}"`);
 return stdout.trim() || `${isPDF ? "PDF" : "Word"} `;
 } catch (err: any) {
 return `${isPDF ? "PDF" : "Word"} `;
 }
}

// ══════════════════════════════════════════════════════════
//
// ══════════════════════════════════════════════════════════

export async function run(rawInput: unknown): Promise<{
 success: boolean; format: OutputFormat; content: string;
 summary: { total: number; buy: number; watch: number; sell: number; errors: number };
 error?: string;
}> {
 let parsed: ReturnType<typeof parseInput>;
 try { parsed = parseInput(rawInput); }
 catch (err: any) {
 return { success: false, format: "markdown", content: `❌ ${err.message}`,
 summary: { total: 0, buy: 0, watch: 0, sell: 0, errors: 0 }, error: err.message };
 }

 const { stocks, positions, outputFormat, mode, includeMarketReview, includeGlobalMacro, includeDividend } = parsed;
 if (!stocks.length) return { success: false, format: outputFormat, content: "❌ ",
 summary: { total: 0, buy: 0, watch: 0, sell: 0, errors: 0 } };

 log(` ${stocks.length} ${stocks.join(", ")} | ${outputFormat}`);

 //
 let globalMacro: string | undefined;
 let marketOverview: string | undefined;
 await Promise.all([
 includeGlobalMacro ? fetchGlobalMacro().then((r) => { globalMacro = r; }) : Promise.resolve(),
 includeMarketReview ? fetchMarketOverview().then((r) => { marketOverview = r; }) : Promise.resolve(),
 ]);

 //
 let stockDataList;
 try {
 stockDataList = await fetchMultipleStocks(stocks, mode);
 log(`${stockDataList.filter((d) => !d.error).length}/${stocks.length}`);
 } catch (err: any) {
 return { success: false, format: outputFormat, content: `❌ ${err.message}`,
 summary: { total: stocks.length, buy: 0, watch: 0, sell: 0, errors: stocks.length }, error: err.message };
 }

 // LLM
 const analysisResults = await analyzeMultipleStocks(stockDataList, outputFormat, positions, includeDividend);

 //
 const signals: Record<string, Verdict> = {};
 for (const r of analysisResults) signals[r.code] = r.verdict;
 await checkAlerts(signals).catch(() => {}); //

 //
 let content: string;
 try {
 const markdown = buildFullReport(analysisResults, globalMacro, marketOverview);
 if (outputFormat === "pdf") content = await exportToFormat(markdown, "pdf");
 else if (outputFormat === "word") content = await exportToFormat(markdown, "word");
 else content = markdown;
 } catch (err: any) {
 return { success: false, format: outputFormat, content: `❌ ${err.message}`,
 summary: { total: stocks.length, buy: 0, watch: 0, sell: 0, errors: stocks.length }, error: err.message };
 }

 const summary = {
 total: analysisResults.length,
 buy: analysisResults.filter((r) => ["", ""].includes(r.verdict)).length,
 watch: analysisResults.filter((r) => r.verdict === "").length,
 sell: analysisResults.filter((r) => r.verdict === "").length,
 errors: stockDataList.filter((d) => d.error).length,
 };

 log(` ✅ :${summary.buy} :${summary.watch} :${summary.sell}`);
 return { success: true, format: outputFormat, content, summary };
}

// ══════════════════════════════════════════════════════════
//
// ══════════════════════════════════════════════════════════

export async function runDividend(tickers: string | string[]): Promise<string> {
 const codes = Array.isArray(tickers) ? tickers : tickers.split(/[,\s]+/).filter(Boolean);
 log(`${codes.join(", ")}`);
 const results = await analyzeDividends(codes.map((c) => c.toUpperCase()));

 let output = `# 💰 \n**** ${new Date().toLocaleDateString("zh-CN")}\n\n---\n\n`;
 for (const r of results) output += formatDividendMarkdown(r) + "\n\n---\n\n";
 output += "__";
 return output;
}

// ══════════════════════════════════════════════════════════
//
// ══════════════════════════════════════════════════════════

export async function runRumorScan(): Promise<string> {
 log("...");
 const result = await scanRumors();
 return formatRumorMarkdown(result);
}

// ══════════════════════════════════════════════════════════
//
// ══════════════════════════════════════════════════════════

export async function runWatchlistAdd(
 ticker: string,
 opts: { targetPrice?: number; stopPrice?: number; alertOnSignal?: boolean; notes?: string } = {}
): Promise<string> {
 const result = await addToWatchlist(ticker, opts);
 return result.message;
}

export async function runWatchlistRemove(ticker: string): Promise<string> {
 const result = await removeFromWatchlist(ticker);
 return result.message;
}

export async function runWatchlistList(): Promise<string> {
 const data = await listWatchlist();
 return formatWatchlistMarkdown(data);
}

export async function runWatchlistCheck(): Promise<string> {
 const result = await checkAlerts();
 return formatAlertsMarkdown(result);
}

// ══════════════════════════════════════════════════════════
// K
// ══════════════════════════════════════════════════════════

export async function runChartAnalysis(
 stockCode: string,
 imageUrlOrBase64: string,
 isBase64 = false
): Promise<{ success: boolean; content: string }> {
 try {
 const result = await analyzeChartImage(imageUrlOrBase64, stockCode, isBase64);
 return { success: true, content: result };
 } catch (err: any) {
 return { success: false, content: `K${err.message}` };
 }
}

// ══════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════

async function cli() {
 const args = process.argv.slice(2);
 const cmd = args[0];

 if (!cmd || cmd === "--help") {
 console.log(`
Stock Analysis Skill CLI


 analyze <,...> [markdown|pdf|word] [--market-review] [--dividend]
 dividend <,...>
 rumors
 watch add <> [--target ] [--stop ] [--signal]
 watch remove <>
 watch list
 watch check


 ts-node src/index.ts analyze 600519,00700.HK,AAPL
 ts-node src/index.ts analyze AAPL --dividend
 ts-node src/index.ts dividend JNJ PG KO
 ts-node src/index.ts rumors
 ts-node src/index.ts watch add AAPL --target 200 --stop 150
 ts-node src/index.ts watch list
 `);
 process.exit(0);
 }

 if (cmd === "analyze") {
 const codes = (args[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
 const format = (["markdown", "pdf", "word"].find((f) => args.includes(f)) as OutputFormat) ?? "markdown";
 const includeMarketReview = args.includes("--market-review");
 const includeDividend = args.includes("--dividend");
 const result = await run({ stocks: codes, outputFormat: format, includeMarketReview, includeDividend });
 console.log(result.content);
 console.log("\n📊 :", result.summary);

 } else if (cmd === "dividend") {
 const codes = args.slice(1).filter((a) => !a.startsWith("--"));
 console.log(await runDividend(codes));

 } else if (cmd === "rumors") {
 console.log(await runRumorScan());

 } else if (cmd === "watch") {
 const sub = args[1];
 if (sub === "add") {
 const ticker = args[2];
 const targetIdx = args.indexOf("--target");
 const stopIdx = args.indexOf("--stop");
 console.log(await runWatchlistAdd(ticker, {
 targetPrice: targetIdx >= 0 ? Number(args[targetIdx + 1]) : undefined,
 stopPrice: stopIdx >= 0 ? Number(args[stopIdx + 1]) : undefined,
 alertOnSignal: args.includes("--signal"),
 }));
 } else if (sub === "remove") {
 console.log(await runWatchlistRemove(args[2]));
 } else if (sub === "list") {
 console.log(await runWatchlistList());
 } else if (sub === "check") {
 console.log(await runWatchlistCheck());
 }
 }
}

if (require.main === module) {
 cli().catch((err) => { console.error(err); process.exit(1); });
}
