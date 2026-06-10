/**
 * rumorScanner.ts
 * finance skill
 * Twitter bird CLI + Google News finance skill + LLM
 *
 * M&A / / / SEC /
 */

import { RumorItem, RumorScanResult, RumorType } from "./types";
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// ── calculate_rumor_score─────────

function calcImpactScore(
 type: RumorType,
 text: string,
 hasHighEngagement = false
): { score: number; reason: string } {
 let score = 1;
 const reasons: string[] = [];

 switch (type) {
 case "ma":
 score += 5; reasons.push("/"); break;
 case "insider":
 score += 4; reasons.push(""); break;
 case "analyst":
 score += 3; reasons.push(""); break;
 case "regulatory":
 score += 3; reasons.push(""); break;
 case "earnings":
 score += 2; reasons.push(""); break;
 default:
 score += 1;
 }

 if (/breaking|just in|alert|urgent/i.test(text)) {
 score += 2; reasons.push("");
 }
 if (hasHighEngagement) {
 score += 2; reasons.push("");
 }

 return { score: Math.min(10, score), reason: reasons.join("") };
}

// ── finance skill ──────────────────

async function fetchRumorNews(): Promise<string> {
 try {
 const { stdout } = await execAsync(`ollama run llama3.1 "3 1. merger/acquisition rumors 2. insider buying/selling activity 3. analyst upgrades/downgrades 4. SEC 5. JSON [{'type': 'ma|insider|analyst|regulatory|earnings', 'ticker': 'null', 'headline': '', 'source': '', 'sentiment': 'positive|negative|neutral', 'date': 'YYYY-MM-DD'}] JSON2"`);
 return stdout.trim() || "[]";
 } catch {
 return "[]";
 }
}

// ── LLM ────────────────────────────

async function extractRumors(rawNews: string): Promise<RumorItem[]> {
 try {
 const parsed: any[] = JSON.parse(rawNews.replace(/```json|```/g, "").trim());

 return parsed.map((item) => {
 const type = (item.type as RumorType) ?? "general";
 const text = item.headline ?? "";
 const { score, reason } = calcImpactScore(type, text);

 return {
 type,
 ticker: item.ticker ?? null,
 headline: text,
 source: item.source ?? "finance",
 impactScore: score,
 impactReason: reason,
 sentiment: item.sentiment ?? "neutral",
 date: item.date ?? new Date().toISOString().slice(0, 10),
 } as RumorItem;
 }).sort((a, b) => b.impactScore - a.impactScore);
 } catch {
 return [];
 }
}

// ── ────────────────────────────────────

function aggregateTopTickers(rumors: RumorItem[]): { ticker: string; count: number }[] {
 const counts: Record<string, number> = {};
 for (const r of rumors) {
 if (r.ticker) {
 counts[r.ticker] = (counts[r.ticker] ?? 0) + 1;
 }
 }
 return Object.entries(counts)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 10)
 .map(([ticker, count]) => ({ ticker, count }));
}

// ── ────────────────────────────────────────────

export async function scanRumors(): Promise<RumorScanResult> {
 const scannedAt = new Date().toISOString();

 let rumors: RumorItem[] = [];

 try {
 const rawNews = await fetchRumorNews();
 rumors = await extractRumors(rawNews);
 } catch (err: any) {
 console.error("[scanRumors] :", err.message);
 }

 const topTickers = aggregateTopTickers(rumors);

 //
 const maCount = rumors.filter((r) => r.type === "ma").length;
 const insiderCount = rumors.filter((r) => r.type === "insider").length;
 const analystCount = rumors.filter((r) => r.type === "analyst").length;

 const summary = rumors.length === 0
 ? ""
 : ` ${rumors.length} ${maCount} ${insiderCount} ${analystCount} ${topTickers.length > 0 ? `${topTickers.slice(0, 3).map((t) => `$${t.ticker}`).join("")}` : ""}`;

 return { scannedAt, rumors, topTickers, summary };
}

// ── ────────────────────────────────────────────

export function formatRumorMarkdown(result: RumorScanResult): string {
 const typeLabel: Record<RumorType, string> = {
 ma: "🏢 ",
 insider: "👔 ",
 analyst: "📊 ",
 regulatory: "⚖️ ",
 earnings: "📈 ",
 general: "📰 ",
 };

 const sentimentEmoji: Record<string, string> = {
 positive: "🟢", negative: "🔴", neutral: "⚪",
 };

 let md = `## 🔮
**** ${new Date(result.scannedAt).toLocaleString("zh-CN")}
**${result.summary}**

`;

 if (result.rumors.length === 0) {
 md += "__\n";
 return md;
 }

 //
 const grouped: Partial<Record<RumorType, RumorItem[]>> = {};
 for (const r of result.rumors) {
 if (!grouped[r.type]) grouped[r.type] = [];
 grouped[r.type]!.push(r);
 }

 for (const [type, items] of Object.entries(grouped)) {
 md += `### ${typeLabel[type as RumorType] ?? type}\n\n`;
 for (const item of items!.slice(0, 3)) {
 md += `**[ ${item.impactScore}/10]** ${sentimentEmoji[item.sentiment]} ${item.headline}\n`;
 if (item.ticker) md += `> $${item.ticker}\n`;
 md += `> ${item.source}${item.date}${item.impactReason}\n\n`;
 }
 }

 //
 if (result.topTickers.length > 0) {
 md += `### 📊 \n`;
 md += result.topTickers.map((t) =>
 `- $${t.ticker} ${t.count} `
 ).join("\n");
 md += "\n";
 }

 return md;
}
