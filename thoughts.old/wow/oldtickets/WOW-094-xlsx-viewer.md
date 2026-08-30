# WOW-094: XLSX Document Viewer & Data Visualization

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Research Findings & Compliance Requirements
- **Industristandard**: Byggbranschen använder XLSX för kalkylering, materiallistor och tidsplaner.
- **Krav**: Användare måste kunna läsa, filtrera och visualisera kalkylarksdata direkt i webbläsaren med enterprise-grade precision.
- **Produktionstillförlitlighet**: Parsern måste hantera stora filer, formaterade celler och formler korrekt.

## Problemställning
Systemet kan för närvarande inte rendera XLSX-filer, vilket hindrar användare från att granska viktiga projektfiler (t.ex. `MEDICIONES_SANTA_MONICA.xlsx`).

## Önskat resultat
Fullt stöd för att visa och interagera med kalkylarksfiler i webbläsaren genom en professionell tabellkomponent.

## Krav
- [ ] Installera `xlsx` (SheetJS) för robust kalkylarkshantering.
- [ ] Implementera server-side parser-API för konvertering av XLSX till JSON.
- [ ] Implementera `SpreadsheetTable` React-komponent för rendering av data med stöd för sortering och filtrering.
- [ ] Uppdatera `PreviewContent` i dokumenthanteraren.

---
## Meta
**Created**: 2026-06-06
**Priority**: Critical
**Estimated Effort**: M
