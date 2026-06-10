/**
 * watchlist.ts
 * + storage
 * / /
 */

import { WatchlistItem, WatchlistAlert, Market, Verdict } from "./types";
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const STORAGE_KEY = "watchlist-data";

// ── Storage ──────────────────────────────────────────

async function loadWatchlist(): Promise<WatchlistItem[]> {
 try {
 const result = await (window as any).storage?.get(STORAGE_KEY);
 if (result?.value) return JSON.parse(result.value) as WatchlistItem[];
 } catch {}
 return [];
}

async function saveWatchlist(items: WatchlistItem[]): Promise<void> {
 try {
 await (window as any).storage?.set(STORAGE_KEY, JSON.stringify(items));
 } catch (err: any) {
 console.error("[watchlist] :", err.message);
 }
}

// ── ──────────────────────────────────────────

async function fetchCurrentPrice(ticker: string): Promise<number | null> {
 try {
 const { stdout } = await execAsync(`ollama run llama3.1 "${ticker} JSON{\"price\": }"`);
 const raw = stdout.trim();
 const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
 return typeof parsed.price === "number" ? parsed.price : null;
 } catch {
 return null;
 }
}

function detectMarket(code: string): Market {
 if (/^\d{6}$/.test(code)) return "CN";
 if (/^\d{4,5}\.HK$/i.test(code)) return "HK";
 return "US";
}

// ── ────────────────────────────────────────────

export async function addToWatchlist(
 ticker: string,
 opts: {
 targetPrice?: number;
 stopPrice?: number;
 alertOnSignal?: boolean;
 notes?: string;
 } = {}
): Promise<{ success: boolean; action: string; message: string; item?: WatchlistItem }> {
 ticker = ticker.toUpperCase();
 const currentPrice = await fetchCurrentPrice(ticker);

 if (currentPrice === null) {
 return { success: false, action: "error", message: ` ${ticker} ` };
 }

 const watchlist = await loadWatchlist();
 const existingIdx = watchlist.findIndex((i) => i.ticker === ticker);

 if (existingIdx >= 0) {
 //
 const existing = watchlist[existingIdx];
 if (opts.targetPrice !== undefined) existing.targetPrice = opts.targetPrice;
 if (opts.stopPrice !== undefined) existing.stopPrice = opts.stopPrice;
 if (opts.alertOnSignal !== undefined) existing.alertOnSignal = opts.alertOnSignal;
 if (opts.notes !== undefined) existing.notes = opts.notes;
 watchlist[existingIdx] = existing;
 await saveWatchlist(watchlist);

 return { success: true, action: "updated", message: ` ${ticker} `, item: existing };
 }

 //
 const item: WatchlistItem = {
 ticker,
 market: detectMarket(ticker),
 addedAt: new Date().toISOString(),
 priceAtAdd: currentPrice,
 targetPrice: opts.targetPrice ?? null,
 stopPrice: opts.stopPrice ?? null,
 alertOnSignal: opts.alertOnSignal ?? false,
 lastSignal: null,
 lastCheck: null,
 notes: opts.notes ?? null,
 };

 watchlist.push(item);
 await saveWatchlist(watchlist);

 const alertDesc = [
 opts.targetPrice ? ` $${opts.targetPrice}` : null,
 opts.stopPrice ? ` $${opts.stopPrice}` : null,
 opts.alertOnSignal ? "" : null,
 ].filter(Boolean).join("");

 return {
 success: true, action: "added",
 message: ` ${ticker} $${currentPrice}${alertDesc ? `${alertDesc}` : ""}`,
 item,
 };
}

// ── ────────────────────────────────────────────

export async function removeFromWatchlist(
 ticker: string
): Promise<{ success: boolean; message: string }> {
 ticker = ticker.toUpperCase();
 const watchlist = await loadWatchlist();
 const filtered = watchlist.filter((i) => i.ticker !== ticker);

 if (filtered.length === watchlist.length) {
 return { success: false, message: `${ticker} ` };
 }

 await saveWatchlist(filtered);
 return { success: true, message: ` ${ticker}` };
}

// ── ────────────────────────────────────────

export async function listWatchlist(): Promise<{
 items: Array<WatchlistItem & {
 currentPrice: number | null;
 changePct: number | null;
 toTargetPct: number | null;
 toStopPct: number | null;
 }>;
 count: number;
}> {
 const watchlist = await loadWatchlist();
 if (!watchlist.length) return { items: [], count: 0 };

 const items = await Promise.all(watchlist.map(async (item) => {
 const currentPrice = await fetchCurrentPrice(item.ticker);

 const changePct = currentPrice && item.priceAtAdd
 ? parseFloat((((currentPrice - item.priceAtAdd) / item.priceAtAdd) * 100).toFixed(2))
 : null;

 const toTargetPct = currentPrice && item.targetPrice
 ? parseFloat((((item.targetPrice - currentPrice) / currentPrice) * 100).toFixed(2))
 : null;

 const toStopPct = currentPrice && item.stopPrice
 ? parseFloat((((item.stopPrice - currentPrice) / currentPrice) * 100).toFixed(2))
 : null;

 return { ...item, currentPrice, changePct, toTargetPct, toStopPct };
 }));

 return { items, count: items.length };
}

// ── ──────────────────────────────────────────────

export async function checkAlerts(
 currentSignals?: Record<string, Verdict>
): Promise<{ alerts: WatchlistAlert[]; count: number }> {
 const watchlist = await loadWatchlist();
 const alerts: WatchlistAlert[] = [];
 const now = new Date().toISOString();

 for (const item of watchlist) {
 const currentPrice = await fetchCurrentPrice(item.ticker);
 if (currentPrice === null) continue;

 //
 if (item.targetPrice && currentPrice >= item.targetPrice) {
 alerts.push({
 ticker: item.ticker,
 alertType: "target_hit",
 message: `🎯 ${item.ticker} $${currentPrice.toFixed(2)} ≥ $${item.targetPrice}`,
 currentPrice,
 triggerValue: item.targetPrice,
 timestamp: now,
 });
 }

 //
 if (item.stopPrice && currentPrice <= item.stopPrice) {
 alerts.push({
 ticker: item.ticker,
 alertType: "stop_hit",
 message: `🛑 ${item.ticker} $${currentPrice.toFixed(2)} ≤ $${item.stopPrice}`,
 currentPrice,
 triggerValue: item.stopPrice,
 timestamp: now,
 });
 }

 //
 if (item.alertOnSignal && currentSignals?.[item.ticker]) {
 const newSignal = currentSignals[item.ticker];
 if (item.lastSignal && newSignal !== item.lastSignal) {
 alerts.push({
 ticker: item.ticker,
 alertType: "signal_change",
 message: `📊 ${item.ticker} ${item.lastSignal} → ${newSignal}`,
 currentPrice,
 triggerValue: `${item.lastSignal} → ${newSignal}`,
 timestamp: now,
 });
 }
 //
 item.lastSignal = newSignal;
 }

 item.lastCheck = now;
 }

 // lastSignal lastCheck
 await saveWatchlist(watchlist);

 return { alerts, count: alerts.length };
}

// ── Markdown─────────────────────────

export function formatWatchlistMarkdown(data: Awaited<ReturnType<typeof listWatchlist>>): string {
 if (data.count === 0) {
 return `## 📋 \n\n_ \`/stock_watch AAPL\` _\n`;
 }

 let md = `## 📋 ${data.count} \n\n`;
 md += `| | | | | | | |\n`;
 md += `|------|--------|--------|--------|--------|--------|----------|\n`;

 for (const item of data.items) {
 const price = item.currentPrice ? `$${item.currentPrice.toFixed(2)}` : "";
 const change = item.changePct !== null
 ? `${item.changePct > 0 ? "🟢+" : "🔴"}${item.changePct.toFixed(2)}%`
 : "";
 const target = item.targetPrice ? `$${item.targetPrice}` : "";
 const stop = item.stopPrice ? `$${item.stopPrice}` : "";
 const toTarget = item.toTargetPct !== null ? `${item.toTargetPct > 0 ? "+" : ""}${item.toTargetPct.toFixed(1)}%` : "";
 const signal = item.lastSignal ?? "";

 md += `| ${item.ticker} | ${price} | ${change} | ${target} | ${stop} | ${toTarget} | ${signal} |\n`;
 }

 //
 const triggered = data.items.filter(
 (i) => (i.targetPrice && i.currentPrice && i.currentPrice >= i.targetPrice) ||
 (i.stopPrice && i.currentPrice && i.currentPrice <= i.stopPrice)
 );

 if (triggered.length > 0) {
 md += `\n### ⚡ \n`;
 for (const item of triggered) {
 if (item.targetPrice && item.currentPrice && item.currentPrice >= item.targetPrice) {
 md += `- 🎯 **${item.ticker}** $${item.targetPrice}\n`;
 }
 if (item.stopPrice && item.currentPrice && item.currentPrice <= item.stopPrice) {
 md += `- 🛑 **${item.ticker}** $${item.stopPrice}\n`;
 }
 }
 }

 return md;
}

// ── Markdown────────────────────────────

export function formatAlertsMarkdown(result: Awaited<ReturnType<typeof checkAlerts>>): string {
 if (result.count === 0) {
 return `## 🔔 \n\n__\n`;
 }

 let md = `## 🔔 ${result.count} \n\n`;
 for (const alert of result.alerts) {
 md += `- ${alert.message}\n`;
 }
 return md;
}
