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
