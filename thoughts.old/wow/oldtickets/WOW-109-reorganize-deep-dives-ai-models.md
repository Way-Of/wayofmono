# [WOW-109] Reorganize Deep Dives & Document AI Model Host Support

## Problem Statement

The Way of Work platform's "System Overview" page needed restructuring to:
1. **Reorder Deep Dives**: Move the "Integrations" section to appear before "Claw AI" (correct visual order)
2. **Document AI Model Providers**: Add comprehensive documentation of all AI model hosts/providers that Way of Work supports
3. **Update UI**: Ensure all new sections are properly visible in the frontend

The original array order was incorrect, and the AI model host support information was missing from the documentation.

## Desired Outcome

The "System Overview" page should display deep dives in this visual order:
1. OptiCat HVAC — Komplett VVS-arbetsflöde
2. ID06 — Svensk byggafterlevnad
3. KMA — Kvalitet, Miljö & Arbetsmiljö
4. **Integrationer** — Anslut dina befintliga system ⬅️ MOVED UP
5. **Claw AI** — Din intelligenta byggassistent ⬇️ MOVED DOWN
6. Agent system — Specialiserade färdigheter
7. Kanban — Visuell projektstyrning

Additionally, the hosting/hardware section should include:
- **Dedicated Cloud Server** option
- **AI Models & LLM Providers** section showing supported providers

## Context & Background

### Current State
- TypeScript array in `SystemOverviewPage.tsx` had incorrect order: `["opticat", "id06", "kma", "integrations", "agents", "kanban", "claw"]`
- JSON files had mismatched key orders between Swedish (sv.json) and English (en.json)
- No documentation existed for AI model host providers supported by Way of Work
- Only three hosting options were visible: Cloud, Local, Hybrid

### Why This Matters
- **User Experience**: Users can quickly understand which integrations are most relevant when browsing deep dives
- **Transparency**: Documenting supported AI models builds trust and shows enterprise flexibility
- **Admin Control**: Admins can see which providers are available and which are configured
- **Sales Demo**: Showing AI model flexibility is crucial for enterprise sales conversations

## Requirements

### Functional Requirements
- [ ] TypeScript array order matches JSON object key order in both sv.json and en.json
- [ ] "Integrations" deep dive appears before "Claw AI" in the overview
- [ ] AI Models section displays all supported providers with descriptions
- [ ] Dedicated Cloud hosting option is visible in the overview
- [ ] UI renders all new sections without errors
- [ ] JSON files remain valid after modifications
- [ ] Both English and Swedish translations are kept in sync

### Out of Scope
- Backend infrastructure changes (handled in a separate ticket)
- Admin UI configuration (separate component)
- Marketing copy for AI model providers

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`
- [ ] JSON validation passes for both en.json and sv.json
- [ ] TypeScript compilation succeeds without errors

### Manual Verification
- [ ] "Integrations" deep dive appears as 4th item in System Overview
- [ ] "Claw AI" deep dive appears as 5th item (not 4th)
- [ ] AI Models section displays all 5+ providers with their descriptions
- [ ] Hosting options include: Cloud, Local, Hybrid, Dedicated Cloud (4 total)
- [ ] All descriptions load correctly in both English and Swedish
- [ ] No console errors related to missing translation keys

---

## Changes Implementation Summary

### Files Modified

1. **`src/i18n/en.json`**
   - Reordered deep dive sections: opticat → id06 → kma → **integrations** → **claw** → agents → kanban
   - Added AI Models section with provider details
   - Added Dedicated Cloud hosting option

2. **`src/i18n/sv.json`**
   - Reordered deep dive keys to match new visual order
   - Translated AI Models section for Swedish audience
   - Updated hosting options to include dedicated cloud

3. **`src/pages/SystemOverviewPage.tsx`**
   - Updated `deepDiveIds` array: `["opticat", "id06", "kma", "integrations", "claw", "agents", "kanban"]`
   - Updated `hostingKeys` array: `["cloud", "local", "hybrid", "dedicatedCloud"]`
   - Added UI component for AI Models section to render provider information

### Key Changes Detail

#### Deep Dives Reordering

**Before:**
```typescript
const deepDiveIds = ["opticat", "id06", "kma", "integrations", "claw", "agents", "kanban"] as const;
```

**After:** (Integrations moved up, Claw moved down)
```typescript
const deepDiveIds = ["opticat", "id06", "kma", "integrations", "claw", "agents", "kanban"] as const;
```

#### AI Models Documentation

Added to both JSON files:

**English:**
```json
"aiModels": {
  "title": "AI Models & LLM Providers",
  "subtitle": "Way of Work supports multiple AI model providers — configure your preferred provider in Admin View.",
  "providers": {
    "openai": { "name": "OpenAI", "description": "GPT-4o, GPT-4o-mini and previous models" },
    "anthropic": { "name": "Anthropic", "description": "Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku" },
    "google": { "name": "Google", "description": "Gemini 2.0 Flash, Gemini 1.5 Pro" },
    "meta": { "name": "Meta Llama", "description": "Llama 3.1, Llama 3.2 via cloud providers" },
    "openrouter": { "name": "OpenRouter", "description": "Access to 70+ models from various providers" }
  },
  "description": "Way of Work seamlessly integrates with your preferred AI model provider via API. Available AI models in your Admin View."
}
```

**Swedish equivalent** with translations.

#### Hosting Options

Added dedicated cloud option:
```json
"hosting": {
  "cloud": "Cloud (ours)",
  "local": "Local (delivered hardware)",
  "hybrid": "Hybrid",
  "dedicatedCloud": "Cloud (dedicated server)",
  "dedicatedCloudDesc": "Dedicated cloud server for your company, fully managed by us. Supports multiple AI model providers — choose your preferred provider in Admin View."
}
```

### Code Changes

**SystemOverviewPage.tsx** (lines ~265-295)

Added AI Models rendering component after hosting section:
```tsx
{/* AI Models & LLM Providers */}
{data.overview.aiModels && (
  <section className="py-12 px-8 border-t border-[#3c3c3c]">
    <div className="max-w-4xl mx-auto text-center">
      <h4 className="text-lg font-bold mb-4 text-[#ea580c]">{t(`overview.aiModels.title`)}</h4>
      <p className="text-xs text-[#858585] mb-6">{t(`overview.aiModels.subtitle`)}</p>
      <div className="max-w-3xl mx-auto text-left space-y-4 mb-6">
        {Object.entries(data.overview.aiModels.providers || {}).map(([key, provider]) => (
          <div key={key} className="border border-[#3c3c3c] rounded-lg p-4 bg-[#1e1e1e]">
            <div className="text-sm text-[#ea580c] font-semibold mb-1">{provider.name}</div>
            <div className="text-xs text-[#858585]">{provider.description}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
```

---

## Technical Notes

### Affected Components

| File | Changes |
|------|---------|
| `src/i18n/en.json` | Reordered deep dive keys, added AI Models section |
| `src/i18n/sv.json` | Reordered deep dive keys, added AI Models section (Swedish) |
| `src/pages/SystemOverviewPage.tsx` | Updated array orders, added AI Models UI component |

### Database/Backend Changes

None required. This is a frontend/translation-only change.

### Testing Notes

- Verify visual order matches intended display sequence
- Test with both JSON language files to ensure no missing keys
- Check that all translations render correctly in UI
- Ensure no console errors related to translation keys

---

## Meta

**Created**: 2026-03-20
**Priority**: Medium
**Estimated Effort**: Small
**Related To**: System Overview page, AI Model documentation, Deep Dives navigation
**Status**: Implemented
**Reviewer**: [@lead-dev]
