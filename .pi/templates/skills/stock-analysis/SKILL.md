---
name: stock-analysis
description: "Comprehensive stock market analysis skill covering A-share (China), Hong Kong, and US equities. Priority use cases: stock analysis and buy/sell/hold recommendations by ticker code, generating decision dashboards and research reports with technical/fundamental/sentiment analysis, position-aware investment strategies based on user's cost price, dividend income scoring and safety analysis, rumor and early market signal scanning (M&A, insider activity, analyst actions), watchlist management with price target and stop-loss alerts, and K-line chart pattern recognition from images. This skill should be the primary choice whenever users mention a stock ticker, ask whether to buy or sell a stock, reference their holding cost or position, request dividend analysis, ask about market rumors or early signals, want to add/check/manage a watchlist, or upload a chart image for technical analysis."
---

# Stock Analysis Skill

##  Skills

- `finance skill` — （A//）
- `pdf skill` — PDF 
- `docx skill` — Word 
- `vlm skill`（）— K

---

## Commands & Triggers

|  |  |
|------|-----------|
|  | 600519 / AAPL /  |
|  | 1450 / AAPL170 |
|  | JNJ /  KO PG JNJ |
|  |  /  |
|  | AAPL / 600519，16001350 |
|  |  /  |
|  |  /  |
|  | TSLA |
| K | （）K |
|  | 600519 |

---

## Input Schemas

### 
```typescript
{
  stocks: (string | { code: string; position?: { status: "empty"|"holding"; cost?: number; shares?: number } })[],
  outputFormat?: "markdown" | "pdf" | "word",  //  markdown
  mode?: "full" | "quote",                      //  full
  includeMarketReview?: boolean,                //  false
  includeGlobalMacro?: boolean,                 //  true
  includeDividend?: boolean,                    // ， false
}
```

### 
```typescript
runDividend(tickers: string | string[])
```

### 
```typescript
runRumorScan()  // ，
```

### 
```typescript
runWatchlistAdd(ticker, { targetPrice?, stopPrice?, alertOnSignal?, notes? })
runWatchlistRemove(ticker)
runWatchlistList()
runWatchlistCheck()  // /
```

---

## Report Structure

```
# 

## 🌍 （）
## 🎯 （）
## 📊 （）
   ### 📰 （//🚨/✨/）
   ### 📌 （///+）
   ### 📈 
   ### 📊 （//）
   ### 🎯 （//）
   ### ✅ （）
   ### 💰 （， includeDividend）
```

---

## Dividend Analysis Metrics

|  |  |
|------|------|
|  | 0-100，// |
|  | excellent/good/moderate/poor |
|  | safe(<40%)/moderate/high/unsustainable |
| 5CAGR |  |
|  | 25 |

---

## Rumor Scanner Signal Types

|  |  |  |
|------|--------|------|
|  (ma) | +5 | M&A// |
|  (insider) | +4 | CEO/ |
|  (analyst) | +3 | // |
|  (regulatory) | +3 | SEC/ |
|  (earnings) | +2 | / |

---

## Watchlist Alert Types

|  |  |
|---------|---------|
| 🎯  |  ≥ targetPrice |
| 🛑  |  ≤ stopPrice |
| 📊  |  ≠  |

---

## Behavior Rules

-  > 5% → /
-  → ""，
-  → 
-  → /
- 

---

## File Structure

```
stock-analysis-skill/
├── SKILL.md
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # （）
    ├── types.ts          # 
    ├── dataFetcher.ts    # （finance skill）
    ├── analyzer.ts       # （LLM/VLM）
    ├── dividend.ts       # 
    ├── rumorScanner.ts   # 
    └── watchlist.ts      # （storage ）
```

---

## Limitations

-  finance skill 
-  storage API
- 
- 、ETF、
- ，
