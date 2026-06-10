# WOW-088: Digital Project Folder & Document Management

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Research Findings & Compliance Requirements
- **Dokumentstyrning (ISO 9001)**: Kräver att projektets dokument (ritningar, bygghandlingar) är aktuella, godkända och spårbara. Versionshantering är ett absolut krav.
- **Standardstruktur (Byggbranschen)**: En standardiserad mappstruktur (Ritningar, Bilder, Arbetsordrar, etc.) underlättar samarbetet och uppfyller lagkrav kring arkivering och dokumenthantering.
- **Åtkomstkontroll (PBL)**: Endast behöriga får ändra bygghandlingar, och ändringar måste kunna spåras (vem ändrade vad?).

## Önskat resultat
Varje projekt har en autonom digital projektmapp i `workspace/dokument/Projects/` med standardiserad struktur och strikt versionshantering.

## Krav
- [x] Automatisera mappstruktur per projekt.
- [x] Tvingande filnamnsregler (schema `YYYY-MM-DD-Org-Proj-DocType-Auth-vX.Y`).
- [x] Versionshantering för alla projektfiler via `workspace-storage`.
- [x] Åtkomstkontroll per projektmapp (RBAC/Multi-tenant).

---
## Meta
**Created**: 2026-06-06
**Priority**: Critical
**Estimated Effort**: M
