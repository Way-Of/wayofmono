---
title: "[PROJ-002] Implement @wayofmono/wo-ai — Unified Multi-Provider LLM API"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2024-05-09"
---

## Context
The `@wayofmono/wo-ai` package is the foundation for all Wo agent capabilities — multi-provider LLM abstraction. Reference: `@earendil-works/pi-ai` (48 source files, ~20 providers). This ticket tracks porting the pi-ai API surface to wo-ai.

## Current State (13 source files)
- `complete.ts` — Orchestrator routes to correct provider
- `cost.ts` — Cost calculation from usage
- `model.ts` — Model registry with 8 built-in defaults
- `oauth.ts` — Basic OAuth provider factory
- `string-enum.ts` — TypeBox helper
- `types.ts` — All shared types (Api, Model, Message, Usage, CompletionParams, etc.)
- `tokens.ts` — NEW: Token counting, context window validation
- `overflow.ts` — NEW: Context overflow detection (20+ regex patterns)
- `retry.ts` — NEW: fetchWithRetry with exponential backoff
- `providers/openai.ts` — OpenAI provider (fetch wrapper updated with retry)
- `providers/anthropic.ts` — Anthropic provider (fetch wrapper updated with retry)
- `providers/gemini.ts` — Gemini provider (fetch wrapper updated with retry)
- `index.ts` — Barrel exports

## Completed Work
- [x] `complete()` — dispatches to correct provider by model.api
- [x] `completeSimple()` — convenience wrapper for single-turn
- [x] `completeWithConfig()` — resolves ModelConfig then calls complete
- [x] Model registry: `getModel()`, `getModels()`, `getModelsByApi()`, `registerModel()`, `initDefaultModels()`
- [x] `resolveModelConfig()` — resolves config to model + auth
- [x] Token counting: `estimateTokenCount()`, `estimateMessageTokens()`, `estimateMessagesTokens()`, `validateContextWindow()`, `calculateContextTokens()`
- [x] Context overflow detection: `isContextOverflow()` with 23 regex patterns + silent overflow detection
- [x] Retry logic: `fetchWithRetry()` with exponential backoff, `isRetryableError()`
- [x] All 3 providers updated to use `fetchWithRetry` for both streaming and non-streaming paths
- [x] `calculateCost()` — usage → dollar amount
- [x] OAuth provider factory + registry
- [x] StringEnum TypeBox helper

## Missing vs pi/ai (30+ files)

### Provider Implementations (wo has 3, pi has 18)
- [ ] `providers/openai-completions.ts` — Covers Together AI, xAI, Groq, DeepSeek, OpenRouter, Fireworks, Cerebras, etc.
- [ ] `providers/openai-responses.ts` — OpenAI Responses API
- [ ] `providers/openai-codex-responses.ts` — ChatGPT Codex (WebSocket + SSE, 1351 lines)
- [ ] `providers/azure-openai-responses.ts` — Azure OpenAI
- [ ] `providers/google-vertex.ts` — Google Vertex AI
- [ ] `providers/amazon-bedrock.ts` — AWS Bedrock
- [ ] `providers/cloudflare.ts` — Cloudflare AI Gateway + Workers AI
- [ ] `providers/mistral.ts` — Mistral AI
- [ ] `providers/faux.ts` — Test/mock provider
- [ ] `providers/github-copilot-headers.ts` — GitHub Copilot auth headers
- [ ] `providers/register-builtins.ts` — Built-in provider registration
- [ ] `providers/simple-options.ts` — Shared options builder
- [ ] `providers/transform-messages.ts` — Message transformation

### Streaming Infrastructure
- [ ] EventStream class (`AssistantMessageEventStream`) — typed protocol with start/text_delta/thinking/toolcall/done/error events
- [ ] `streamSimple()` / `completeSimple()` top-level wrappers
- [ ] Fix `onStream` callback to actually emit per-chunk StreamChunks (currently used as boolean flag)

### OAuth (full flow)
- [ ] PKCE challenge/verifier
- [ ] OAuth redirect page
- [ ] Per-provider OAuth handlers (Anthropic, GitHub Copilot, OpenAI Codex)

### Utilities
- [ ] `api-registry.ts` — Dynamic API provider registry
- [ ] `session-resources.ts` — Session-bound cleanup registry
- [ ] `utils/diagnostics.ts` — Structured assistant message diagnostics
- [ ] `utils/hash.ts` — Hashing
- [ ] `utils/headers.ts` — Header utilities
- [ ] `utils/json-parse.ts` — Safe JSON parsing
- [ ] `utils/sanitize-unicode.ts` — Unicode sanitization
- [ ] `utils/typebox-helpers.ts` — TypeBox utilities
- [ ] `utils/validation.ts` — Input validation
- [ ] Image generation API (`images.ts`, `image-models.ts`, `images-api-registry.ts`)
- [ ] Model definitions for 30+ models (pi generates `models.generated.ts`)

### Provider auto-detection
- [ ] Auto-select provider by model name pattern (e.g., "gpt-4" → openai, "claude" → anthropic, "gemini" → google)

### Error normalization
- [ ] Map provider-specific errors to unified error types
- [ ] Structured error codes per failure mode

## Self-Contained Dependency Requirements
Consumable by external projects. All imports resolve from published package. Must include `exports`, `types`, `files`, `publishConfig`, `repository`.

## Dependencies
- `typebox` (already in package.json)

## Success Criteria
- [ ] `complete()` streams from OpenAI, Anthropic, Gemini
- [ ] `completeSimple()` returns complete response
- [ ] Token counting within 10% of true count
- [ ] Retry fires on 429/5xx with exponential backoff
- [ ] `onStream` receives per-chunk StreamChunk events
- [ ] Tool calling works end-to-end
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
