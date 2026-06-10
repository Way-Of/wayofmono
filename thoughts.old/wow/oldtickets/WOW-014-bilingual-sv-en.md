# WOW-014 [Bilingual System] Swedish + English support throughout the platform

## Problem Statement

The system currently has a mix of Swedish and English in UI labels, agent prompts, skill files, and documentation. Some parts are in Swedish (Admin Console tabs like "Prislistor", "Godkännandekö"), some in English (chat prompts, agent descriptions). There is no language selection mechanism.

Production launches first in Sweden, but English is needed for some users and the global market. Swedish-specific content (laws, regulations, construction standards like AB 04, ABT 06, Swedish building codes) must remain correct regardless of language setting and should only exist in Swedish since they reference Swedish law.

## Desired Outcome

A bilingual system where:
1. Users can switch between Swedish and English in settings
2. UI labels, buttons, and messages are translated
3. Agent system prompts are language-aware
4. Swedish-specific legal/regulatory content is always available (in Swedish) regardless of UI language
5. All tickets (WOW-001 through WOW-014) and documentation are in English (already done)
6. Skills with Swedish legal content (swedish-building-laws, ata, project-pricing) always include the Swedish original

## Context & Background

### Current Language Status

| Area | Current language | Target |
|------|-----------------|--------|
| Ticket documentation (WOW-*) | ✅ English | English |
| Agent `.md` files | Mixed | Prompt language follows user setting + Swedish legal content always included |
| Skill `.md` files | Mixed | Always keep Swedish legal content + English version |
| UI labels (AdminDashboard) | Mixed | Translated via i18n |
| Chat system prompts | English | Language-aware based on user preference |
| CHANGELOG.md | English | Keep English |
| AGENTS.md | English | Keep English |
| UI tab names (Prislistor, Godkännandekö) | Swedish | Keep Swedish in Swedish mode, English in English mode |
| Database (price lists, offers, etc) | Swedish | Keep Swedish — data is language-independent |

### Swedish-Specific Content That Must Stay

These are Swedish legal/regulatory references that must always be included regardless of UI language:
- **AB 04** — General conditions for construction contracts
- **ABT 06** — General conditions for design and construct contracts
- **Räntelagen (1975:635)** — Late payment interest law
- **Bokföringslagen (1999:1078)** — Accounting law (7-year archiving)
- **Skatteverket VAT rules** — 25% VAT, reverse charge for construction
- **Fakturalagen (2013:586)** — Invoice content requirements
- **Sektionsdata / Wikells / Byggtjänst** — Swedish construction pricing standards
- **ÅTA** — Changes, additions, and deductions in construction
- **AMS (Arbetsmiljöverket)** — Swedish work environment regulations
- **Plan- och bygglagen (PBL)** — Planning and building act

### Why This Matters

- First production market is Sweden — Swedish UI is essential
- Some users (international contractors, English-speaking workers) need English
- Future global expansion requires English foundation
- Legal/regulatory content must remain accurate in Swedish regardless of UI language
- Consistent language improves user trust and professionalism

## Requirements

### Functional Requirements

#### Phase 1: i18n Infrastructure
- [x] Add language selection to user settings (profile page or settings modal)
- [x] Store language preference in user profile (`language` column in `users` table)
- [x] Create i18n key-value store (JSON files in `shared/locales/` or similar)
- [x] Add `useTranslation()` hook for React components
- [x] Server-side language detection from user profile or `Accept-Language` header

#### Phase 2: UI Translation
- [x] Translate all Admin Console tab labels:
  - "Prislistor" ↔ "Price Lists"
  - "Godkännandekö" ↔ "Approval Queue"
  - "Arbetare" ↔ "Workers"
  - "Kunder" ↔ "Clients"
  - "Kanaler" ↔ "Channels"
- [ ] Translate chat UI labels (placeholder text, button labels, status messages)
- [ ] Translate form labels, validation messages, error messages
- [ ] Translate empty states ("No price lists yet. Create your first one.")
- [ ] Settings/profile UI in both languages

#### Phase 3: Agent Language Awareness
- [x] Agent system prompt includes user's language preference
- [x] Chat greeting is in user's language
- [x] Agent responses in user's language by default (user can ask to switch)
- [ ] Swedish legal skill content is always appended in Swedish regardless of language
- [ ] Agent `.md` files have language-appropriate prompts

#### Phase 4: Swedish-Specific Content Handling
- [ ] `swedish-building-laws` skill: always included in Swedish, appended to any language system prompt
- [ ] `ata` skill: always in Swedish (ÅTA is a Swedish legal concept)
- [ ] `project-pricing` skill: Swedish references always included + translated overview
- [ ] AB 04 / ABT 06 references: only in Swedish (legal documents have no official English translation)
- [ ] Currency formatting: SEK by default (Swedish locale `sv-SE`), user-selectable

### Out of Scope
- Full machine translation of all agent responses — agents respond in user's chosen language
- Real-time language switching without page reload — acceptable to require reload
- Right-to-left language support — future
- More than 2 languages (SV/EN) — future

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`

### Manual Verification
- [ ] User can switch language in settings → UI updates to Swedish/English
- [x] "Prislistor" shows as "Price Lists" in English mode
- [x] "Godkännandekö" shows as "Approval Queue" in English mode
- [x] Agent greets in user's language
- [ ] Swedish legal content (AB 04, etc.) appears in agent system prompt in Swedish even in English mode
- [x] Chat history and agent responses are in user's language
- [x] Language preference persists across sessions (stored in DB)
- [x] New users default to Swedish (for Sweden production launch)
## Technical Notes

### i18n Approach

Keep it simple — no heavy i18n framework. Use a key-value JSON structure:

```
shared/locales/
  sv.json    { "priceLists": "Prislistor", "approvalQueue": "Godkännandekö", ... }
  en.json    { "priceLists": "Price Lists", "approvalQueue": "Approval Queue", ... }
```

React hook:
```typescript
function useTranslation() {
  const { language } = useUserSettings();
  const t = (key: string) => translations[language][key] ?? key;
  return { t, language };
}
```

### User Language Storage

Add `language TEXT DEFAULT 'sv'` column to `users` table. API endpoint:
- `PUT /api/user/settings` — update language preference
- `GET /api/user/settings` — read current settings

### Agent Language Injection

In `session-prompts.ts` `composeLeadSystem()`, add:
```
"You are speaking {language}. Always respond in {language} unless the user asks otherwise.

Swedish regulatory references (always included):
{swedish_law_skills}
"
```

### Affected Components
- `shared/locales/sv.json` — **New file**: Swedish translations
- `shared/locales/en.json` — **New file**: English translations
- `src/hooks/useTranslation.ts` — **New file**: translation hook
- `src/hooks/useUserSettings.ts` — language preference management
- `src/pages/AdminDashboard.tsx` — translate all tab labels
- `src/components/ChatPanel.tsx` — translate chat UI
- `src/components/simple/SimpleChatView.tsx` — translate chat UI
- `src/components/kanban/KanbanChatPanel.tsx` — translate
- `src/pages/UserProfile.tsx` — add language selector
- `server/db.ts` — add `language` column to users table
- `server/session-prompts.ts` — language-aware system prompts
- `server/index.ts` — `PUT /api/user/settings` endpoint
- `.wo/skills/swedish-building-laws/SKILL.md` — ensure always in Swedish
- `.wo/skills/ata/SKILL.md` — ensure always in Swedish

---

## Meta

**Created**: 2026-05-22
**Priority**: High
**Estimated Effort**: M
**Depends on**: Nothing — can be done in parallel with other tickets
