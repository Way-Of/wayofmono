# WOW-087: Offer & Invoice System Integration

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Research Findings & Compliance Requirements
- **Lagen om e-faktura**: Fakturor till offentlig sektor MÅSTE skickas i strukturerat format (Peppol BIS Billing 3.0). Systemet måste stödja detta.
- **ROT/RUT-krav**: Skatteverket kräver att fakturan tydligt specifierar arbetskostnad, materialkostnad, och kundens personnummer för att utbetalning ska ske. Systemet måste generera denna specifikation korrekt.
- **Bevisstyrka (BankID)**: Trots att e-signatur inte är ett lagkrav för offerter/avtal, krävs BankID-signering för att uppnå högsta bevisstyrka i tvistemål enligt svensk avtalsrätt.
- **Kontering**: Automatisk kontering kräver integration mot kundens bokföringssystem (t.ex. Fortnox API) för att minimera manuell inmatning och fel.

## Önskat resultat
Fullt automatiserat arbetsflöde från offert till fakturering med BankID-signering och Skatteverkets krav på ROT/RUT-filformat.

## Krav
- [x] BankID-integration för dokument signering (juridisk bindande avtal).
- [x] Automatiserade godkännandeflöden för offerter med statusspårning.
- [x] Länkning till projektmappar i `workspace/dokument/` för spårbarhet.
- [x] XML-export (ROT/RUT-filformat) för Skatteverkets e-tjänst.
- [x] Integration med Fortnox/Visma API för automatisk kontering och fakturering.

---
## Meta
**Created**: 2026-06-06
**Priority**: Critical
**Estimated Effort**: M
