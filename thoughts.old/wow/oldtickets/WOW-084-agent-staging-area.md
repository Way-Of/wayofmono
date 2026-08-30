# WOW-084-agent-staging-area

## Problem Statement

AI-agenter i Way of Work saknar för närvarande en strukturerad, persistent arbetsyta ("scratchpad") för att spara pågående arbete, utkast och mellanliggande resonemang innan de begär godkännande. Detta tvingar agenter att arbeta i session-minnet, vilket gör att de tappar kontext vid omstarter, och gör det svårt att implementera en robust Human-in-the-Loop (HITL) process där en administratör kan granska agentens förberedande arbete innan det flyttas till produktion.

## Desired Outcome

Att implementera ett "Staging Area"-mönster där agenter sparar sina utkast till en dedikerad tabell (`pending_changes`). Användare eller administratörer kan sedan granska dessa utkast via ett dedikerat gränssnitt och godkänna dem för exekvering (produktion). Detta garanterar att agenter aldrig skriver direkt till produktion och att allt arbete är spårbart och granskningsbart.

## Requirements

### Functional Requirements
- [ ] **Staging Tool (`stage_draft`):** Skapa ett nytt verktyg som agenter använder för att spara utkast. Verktyget sparar agentens arbete till `pending_changes` med status `DRAFT`.
- [ ] **Produktionsflytt:** Implementera logik för att markera ett utkast som `PENDING_APPROVAL` och trigga en notifikation till en administratör.
- [ ] **Agent-instruktioner:** Uppdatera systemprompter för alla agenter att **STRIKT FÖRBJUDA** direkta databasskrivningar och istället **KRÄVA** användning av `stage_draft` för alla dataändringar.
- [ ] **UI för granskning:** Admin-dashboarden måste kunna visa `DRAFT`-status i godkännandekön så att administratörer kan förhandsgranska agenternas arbete.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
