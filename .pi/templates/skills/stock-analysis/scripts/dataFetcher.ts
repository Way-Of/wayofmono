/**
 * dataFetcher.ts finance skill
 */

import { Market, FetchMode, StockData } from "./types";
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export function detectMarket(code: string): Market {
 if (/^\d{6}$/.test(code)) return "CN";
 if (/^\d{4,5}\.HK$/i.test(code)) return "HK";
 return "US";
}

const MARKET_LABEL: Record<Market, string> = {
 CN: "A", HK: "", US: "",
};

// ── ──────────────────────────────────────────

export async function fetchStockData(
 code: string,
 mode: FetchMode = "full"
): Promise<StockData> {
 const market = detectMarket(code);

 const prompt = mode === "quote"
 ? ` ${code}${MARKET_LABEL[market]} JSON
 name, price, prev_close, change_pct, change_amount, volume, amount, turnover, volume_ratio, market_cap, pe_ttm, pb`
 : ` ${code}${MARKET_LABEL[market]} JSON
 name, price, prev_close, open, high, low, change_pct, change_amount, amplitude,
 volume, amount, turnover, volume_ratio, market_cap, pe_ttm, pb, high_52w, low_52w, dividend_yield,
 ma5, ma10, ma20, bias_pctMA20%,
 trend""/""/"", overbought_warningbias_pct>5true,
 support, resistance, rsi,
 kline_recent_1010 date/open/close/high/low/volume,
 profit_ratio%, avg_cost, chip_concentration,
 roe, gross_margin, net_margin, debt_ratio, eps, revenue_growth,
 main_net, main_net_pct%
 null`;

 try {
 const { stdout } = await execAsync(`ollama run llama3.1 "${prompt.replace(/"/g, '\\"')}"`);
 const raw = stdout.trim();
 const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
 return { code, market, timestamp: new Date().toISOString(), ...parsed };
 } catch (err: any) {
 return { code, market, timestamp: new Date().toISOString(), error: err.message };
 }
}

// ── ──────────────────────────────────────

export async function fetchMultipleStocks(
 codes: string[],
 mode: FetchMode = "full"
): Promise<StockData[]> {
 const results: StockData[] = [];
 for (let i = 0; i < codes.length; i++) {
 results.push(await fetchStockData(codes[i], mode));
 if (i < codes.length - 1) await new Promise((r) => setTimeout(r, 300));
 }
 return results;
}

// ── ──────────────────────────────────────────────

export async function fetchGlobalMacro(): Promise<string> {
 try {
 const { stdout } = await execAsync(`ollama run llama3.1 "Markdown - // - - - - A/1-2 150"`);
 return stdout.trim();
 } catch (err: any) {
 return `${err.message}`;
 }
}

// ── ──────────────────────────────────────────────

export async function fetchMarketOverview(): Promise<string> {
 try {
 const { stdout } = await execAsync(`ollama run llama3.1 "AMarkdown - ///50 - /// - TOP3 TOP3 - - 200"`);
 return stdout.trim();
 } catch (err: any) {
 return `${err.message}`;
 }
}

// ── ──────────────────────────────────────────────

export function validateStockData(data: StockData): {
 valid: boolean;
 warnings: string[];
} {
 const warnings: string[] = [];
 if (data.error) return { valid: false, warnings: [`${data.error}`] };
 if (!data.price) warnings.push("");
 if (!data.ma5 && !data.ma20) warnings.push("");
 if (data.overbought_warning) warnings.push(`⚠️ ${data.bias_pct}% 5%`);
 if (!data.roe && !data.pe_ttm) warnings.push("");
 return { valid: !!data.price, warnings };
}
