# WOW-090: Material & Procurement Integration

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Research Findings & Compliance Requirements
- **EDI-standarder**: Byggbranschen använder BEAst (Byggbranschens Elektroniska Affärsstandard) för fakturering och orderflöden. Systemet måste kunna tolka detta format.
- **Svefaktura/Peppol**: Krav för digital fakturering mot offentlig sektor.
- **Påslagshantering**: För att säkerställa lönsamhet krävs automatiserad koppling mellan grossistprislistor och kundens fakturapriser med förhandlade påslag.
- **Lagerspårbarhet**: Krav på spårbarhet för material, från inköp till montering, vilket kräver koppling till projektets materialinköp.

## Önskat resultat
Way of Work kan läsa in EDI-fakturor (Svefaktura) från grossister (Ahlsell, Dahl, Solar etc.) och automatiskt associera dem med rätt projekt och budgetposter.

## Krav
- [x] Implementera EDI-fakturaimport (XML-parser baserad på BEAst).
- [ ] Implementera produktionstillförlitlig kalkylark-parser (kräver 'xlsx' bibliotek) för hantering av `MEDICIONES_SANTA_MONICA.xlsx` och liknande format.
- [x] Automatiserad mappning av material till projektets kostnadsställen.
- [x] Automatisk tillämpning av förhandlade påslag.
- [x] Integration med lagerhantering och realtidsbudget.

---
## Meta
**Created**: 2026-06-06
**Priority**: Critical
**Estimated Effort**: L
