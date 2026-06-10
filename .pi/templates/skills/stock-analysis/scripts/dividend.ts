/**
 * dividend.ts
 * finance skill
 * / CAGR / /
 */

import { DividendAnalysis, PayoutStatus, IncomeRating } from "./types";
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// ── ──────────────────────────

function calcPayoutStatus(payoutRatio: number | null): PayoutStatus {
 if (payoutRatio === null) return "unknown";
 if (payoutRatio < 40) return "safe";
 if (payoutRatio < 60) return "moderate";
 if (payoutRatio < 80) return "high";
 return "unsustainable";
}

function calcSafetyScore(data: {
 payoutRatio: number | null;
 dividendGrowth5y: number | null;
 consecutiveYears: number | null;
 dividendYield: number | null;
}): { score: number; factors: string[] } {
 let score = 50;
 const factors: string[] = [];

 // ±20
 if (data.payoutRatio !== null) {
 if (data.payoutRatio < 40) { score += 20; factors.push(`${data.payoutRatio.toFixed(0)}%`); }
 else if (data.payoutRatio < 60) { score += 10; factors.push(`${data.payoutRatio.toFixed(0)}%`); }
 else if (data.payoutRatio < 80) { score -= 10; factors.push(`${data.payoutRatio.toFixed(0)}%`); }
 else { score -= 20; factors.push(`${data.payoutRatio.toFixed(0)}%`); }
 }

 // 5±15
 if (data.dividendGrowth5y !== null) {
 if (data.dividendGrowth5y > 10) { score += 15; factors.push(`${data.dividendGrowth5y.toFixed(1)}% CAGR`); }
 else if (data.dividendGrowth5y > 5) { score += 10; factors.push(`${data.dividendGrowth5y.toFixed(1)}% CAGR`); }
 else if (data.dividendGrowth5y > 0) { score += 5; factors.push(`${data.dividendGrowth5y.toFixed(1)}% CAGR`); }
 else { score -= 15; factors.push(`${data.dividendGrowth5y.toFixed(1)}% CAGR`); }
 }

 // ±15
 if (data.consecutiveYears !== null) {
 if (data.consecutiveYears >= 25) { score += 15; factors.push(`${data.consecutiveYears}`); }
 else if (data.consecutiveYears >= 10) { score += 10; factors.push(`${data.consecutiveYears}`); }
 else if (data.consecutiveYears >= 5) { score += 5; factors.push(`${data.consecutiveYears}`); }
 }

 // -10
 if (data.dividendYield !== null) {
 if (data.dividendYield > 8) { score -= 10; factors.push(`${data.dividendYield.toFixed(1)}%`); }
 else if (data.dividendYield < 1) { factors.push(`${data.dividendYield.toFixed(2)}%`); }
 }

 return { score: Math.max(0, Math.min(100, score)), factors };
}

function calcIncomeRating(safetyScore: number): IncomeRating {
 if (safetyScore >= 80) return "excellent";
 if (safetyScore >= 60) return "good";
 if (safetyScore >= 40) return "moderate";
 return "poor";
}

// ── finance skill ──────────────────────

async function fetchDividendData(ticker: string): Promise<Record<string, any>> {
 try {
 const { stdout } = await execAsync(`ollama run llama3.1 "${ticker} JSON name, currentPrice, dividendYield%, annualDividend, trailingEps12, exDividendDate YYYY-MM-DD, paymentFrequency\\\"monthly\\\"/\\\"quarterly\\\"/\\\"annual\\\", dividendHistory5 year total, consecutiveYears, dividendGrowth5y5 CAGR % null"`);
 const raw = stdout.trim();
 return JSON.parse(raw.replace(/```json|```/g, "").trim());
 } catch {
 return {};
 }
}

// ── ────────────────────────────────────────────

export async function analyzeDividend(ticker: string): Promise<DividendAnalysis> {
 ticker = ticker.toUpperCase();

 let raw: Record<string, any> = {};
 try {
 raw = await fetchDividendData(ticker);
 } catch (err: any) {
 return {
 ticker, name: ticker, currentPrice: null,
 dividendYield: null, annualDividend: null,
 payoutRatio: null, payoutStatus: "unknown",
 dividendGrowth5y: null, consecutiveYears: null,
 exDividendDate: null, paymentFrequency: null,
 safetyScore: 0, safetyFactors: [`${err.message}`],
 incomeRating: "poor", dividendHistory: [],
 summary: `${ticker} `,
 };
 }

 //
 if (!raw.annualDividend || raw.annualDividend === 0) {
 return {
 ticker, name: raw.name ?? ticker,
 currentPrice: raw.currentPrice ?? null,
 dividendYield: null, annualDividend: null,
 payoutRatio: null, payoutStatus: "no_dividend",
 dividendGrowth5y: null, consecutiveYears: null,
 exDividendDate: null, paymentFrequency: null,
 safetyScore: 0, safetyFactors: [""],
 incomeRating: "no_dividend", dividendHistory: [],
 summary: `${ticker} `,
 };
 }

 //
 const payoutRatio = (raw.trailingEps && raw.trailingEps > 0 && raw.annualDividend)
 ? parseFloat(((raw.annualDividend / raw.trailingEps) * 100).toFixed(1))
 : null;

 const payoutStatus = calcPayoutStatus(payoutRatio);
 const { score: safetyScore, factors: safetyFactors } = calcSafetyScore({
 payoutRatio,
 dividendGrowth5y: raw.dividendGrowth5y ?? null,
 consecutiveYears: raw.consecutiveYears ?? null,
 dividendYield: raw.dividendYield ?? null,
 });

 const incomeRating = calcIncomeRating(safetyScore);

 //
 const parts: string[] = [];
 if (raw.dividendYield) parts.push(` ${Number(raw.dividendYield).toFixed(2)}%`);
 if (payoutRatio) parts.push(` ${payoutRatio.toFixed(0)}%`);
 if (raw.dividendGrowth5y) parts.push(`5 ${Number(raw.dividendGrowth5y) > 0 ? "+" : ""}${Number(raw.dividendGrowth5y).toFixed(1)}%`);
 if (raw.consecutiveYears && raw.consecutiveYears >= 5) parts.push(` ${raw.consecutiveYears} `);

 const ratingLabel: Record<IncomeRating, string> = {
 excellent: "", good: "", moderate: "", poor: "", no_dividend: "",
 };

 return {
 ticker,
 name: raw.name ?? ticker,
 currentPrice: raw.currentPrice ?? null,
 dividendYield: raw.dividendYield ? Number(Number(raw.dividendYield).toFixed(2)) : null,
 annualDividend: raw.annualDividend ?? null,
 payoutRatio,
 payoutStatus,
 dividendGrowth5y: raw.dividendGrowth5y ? Number(Number(raw.dividendGrowth5y).toFixed(2)) : null,
 consecutiveYears: raw.consecutiveYears ?? null,
 exDividendDate: raw.exDividendDate ?? null,
 paymentFrequency: raw.paymentFrequency ?? null,
 safetyScore,
 safetyFactors,
 incomeRating,
 dividendHistory: raw.dividendHistory ?? [],
 summary: `${ticker}${raw.name ?? ""}${parts.join("")}${ratingLabel[incomeRating]}`,
 };
}

// ── Markdown ─────────────────────────

export function formatDividendMarkdown(analysis: DividendAnalysis): string {
 if (analysis.incomeRating === "no_dividend") {
 return `### 💰 · ${analysis.ticker}\n\n`;
 }

 const ratingEmoji: Record<IncomeRating, string> = {
 excellent: "🏆", good: "✅", moderate: "⚠️", poor: "❌", no_dividend: "",
 };

 const payoutLabel: Record<string, string> = {
 safe: "✅ ", moderate: "⚠️ ", high: "⚠️ ", unsustainable: "❌ ", unknown: "",
 };

 let md = `### 💰 · ${analysis.ticker}${analysis.name}

| | |
|------|------|
| | ${analysis.dividendYield ? `${analysis.dividendYield}%` : ""} |
| | ${analysis.annualDividend ? `$${analysis.annualDividend}` : ""} |
| | ${analysis.paymentFrequency ?? ""} |
| | ${analysis.exDividendDate ?? ""} |
| | ${analysis.payoutRatio ? `${analysis.payoutRatio}%${payoutLabel[analysis.payoutStatus]}` : ""} |
| 5 | ${analysis.dividendGrowth5y ? `${analysis.dividendGrowth5y > 0 ? "+" : ""}${analysis.dividendGrowth5y}%` : ""} |
| | ${analysis.consecutiveYears ?? ""} |

**${analysis.safetyScore}/100${ratingEmoji[analysis.incomeRating]} ${analysis.incomeRating.toUpperCase()}**


${analysis.safetyFactors.map((f) => `- ${f}`).join("\n")}
`;

 if (analysis.dividendHistory.length > 0) {
 md += `\n\n`;
 md += analysis.dividendHistory.slice(0, 5).map((h) => `- ${h.year}$${h.total}`).join("\n");
 }

 return md;
}

// ── ──────────────────────────────────────────────

export async function analyzeDividends(tickers: string[]): Promise<DividendAnalysis[]> {
 const results: DividendAnalysis[] = [];
 for (const ticker of tickers) {
 results.push(await analyzeDividend(ticker));
 await new Promise((r) => setTimeout(r, 200));
 }
 return results;
}
