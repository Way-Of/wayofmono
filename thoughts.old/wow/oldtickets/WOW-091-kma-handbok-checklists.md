# WOW-091: KMA-Handbok & Digitala Checklistor

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Research Findings & Compliance Requirements
- **KMA-handbok**: Företagsövergripande styrdokument (Policy, SAM, organisation).
- **KMA-plan**: Projektspecifik plan (riskanalys, kontrollplan).
- **Lagkrav (AFS 2023:1)**: Systematiskt arbetsmiljöarbete (SAM) är obligatoriskt. Alla risker ska dokumenteras, bedömas och åtgärdas.
- **Dokumentation**: Lagkrav på spårbarhet och bevis på kontroller (t.ex. vid våtrumsarbeten, el, ställningsbyggnad).
- **Kvalitetssäkring**: Egenkontroller krävs för att säkerställa att utfört arbete uppfyller samhällets krav (PBL/BBR).

## Önskat resultat
Ett integrerat system för att skapa, fylla i och arkivera KMA-dokumentation, checklistor, riskanalyser och miljörapporter direkt i mobilen.

## Krav
- [x] Databasmodell för Checklistor och Rapporter (KMA) med stöd för versionering.
- [x] API-slutpunkter för att hämta, skapa och arkivera checklistor.
- [x] Frontend-komponent för mobil visning och ifyllnad av KMA-checklistor.
- [x] Stöd för bifogade foton/bevis på utfört arbete (fotodokumentation).
- [x] SAM-efterlevnad (Systematiskt Arbetsmiljöarbete).

---
## Meta
**Skapad**: 2026-06-06
**Prioritet**: Critical
**Uppskattad insats**: M


# KMA (Kvalitet, Miljö, Arbetsmiljö) - Teknisk Specifikation (WOW-091)

## 1. Datastruktur
För att stödja dynamiska checklistor behöver vi en strukturerad lagring i `kma_checklists` och `kma_submissions`.

### kma_checklists (Mallar)
`structure_json` ska innehålla en array av kontrollpunkter:
```json
[
  { "id": "1", "type": "checkbox", "label": "Är ställningen besiktigad?" },
  { "id": "2", "type": "photo", "label": "Foto på ställningsinfästning" },
  { "id": "3", "type": "text", "label": "Kommentar" }
]
```

### kma_submissions (Resultat)
`submission_data_json` lagrar svaren:
```json
{
  "1": true,
  "2": "photo_uuid_123.jpg",
  "3": "Allt ser bra ut"
}
```

## 2. API-struktur (Frontend-behov)
- `GET /api/kma/checklists` — Lista mallar.
- `GET /api/kma/checklists/:id` — Hämta specifik mall för visning.
- `POST /api/kma/submissions` — Skicka in ifylld checklist.
- `GET /api/projects/:id/kma-submissions` — Historik för projektet.

## 3. Integrationer
- BankID-verifiering för signering av slutlig KMA-rapport (framtida krav).
- Integration med `file_upload` för hantering av foton.
