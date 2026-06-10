# WOW-092: Realtidsbudget & Ekonomisk Uppföljning

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Research Findings & Compliance Requirements
- **Ekonomisk uppföljning**: Industristandard kräver realtidskontroll av avvikelser (faktiska kostnader vs. budget) för att möjliggöra tidiga korrigerande åtgärder och säkerställa lönsamhet.
- **KPI:er**: Viktiga nyckeltal inkluderar produktionskostnad per enhet, timmar per moment, och materialförbrukning.
- **Ekonomiintegration**: Budgetdata måste kunna synkas mot projektets totala ekonomi i bokföringssystemet (t.ex. Fortnox/Visma) för att säkerställa korrekt ekonomisk överblick.

## Önskat resultat
Ett verktyg i admin-panelen och för projektledare som visar budget vs. faktiska kostnader (timmar + material) i realtid per projekt.

## Krav
- [x] Beräkningslogik som summerar timkostnader (timmar * snittpris) + materialkostnader i realtid.
- [x] API-slutpunkt `GET /api/projects/:id/budget-summary` för hämtning av ekonomisk status.
- [x] Frontend-visning för realtidsbudget i projektvyn.
- [x] Varningssystem för när budget överskrids.

---
## Meta
**Skapad**: 2026-06-06
**Prioritet**: Critical
**Uppskattad insats**: M
