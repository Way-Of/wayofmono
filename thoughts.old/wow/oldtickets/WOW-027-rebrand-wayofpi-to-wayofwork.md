# Ticket: Systematic Rebrand and Cleanup: wayofpi → wayofwork, .pi → .wo

## Objective
1. Systematically purge all "wayofpi" references (rebrand to "wayofwork").
2. Investigate components mislabeled as "Technical" to identify if they are actually used by "Simple" or "Claw" modes.
3. [BLOCKED] Remove/deprecate truly dead "Technical Mode" components.
4. **Replace all `pi` runtime code with `wo` (`.wo` / `@wayofmono/wo-agent` SDK).**

## Background
The application has undergone a rebrand. The legacy `pi` CLI runtime has been replaced by `@wayofmono/wo-agent` SDK. **All `.pi/` paths, `pi*` API fields, and `Pi` user-facing labels must be migrated to `.wo/` / `wo*` / `Wo`.**

## Completed (2026-06-02)

### Path Replacement
- [x] All `.pi/agents/` → `.wo/agents/` across 30+ files
- [x] All `.pi/settings.json` → `.wo/settings.json`
- [x] All `.pi/extensions/` → `.wo/extensions/`
- [x] All `.pi/skills/` → `.wo/skills/`
- [x] All `~/.pi/agent/` → `~/.wo/agent/`
- [x] `.index/manifest.json` and `.index/state.json` updated

### API/Config Field Renames (Breaking Change)
- [x] `piDrivesChat` → `woDrivesChat` (server response + all frontend consumers)
- [x] `piChatEngineRequested` → `woChatEngineRequested`
- [x] `piBinaryResolved` → `woBinaryResolved`
- [x] `piAutomationReady` → `woAutomationReady`
- [x] `piBinary` (config field) → `woBinary`

### Environment Variable
- [x] `WOP_PI_BINARY` → `WOP_WO_BINARY` in all code references

### Frontend Variable/Type Renames
- [x] `PiModelConfigPath` → `WoModelConfigPath`
- [x] `piModelConfigPaths` → `woModelConfigPaths`
- [x] `showPiCliHelpInDock` → `showWoCliHelpInDock`
- [x] `piTelegramInSettings` → `woTelegramInSettings`
- [x] `piWhatsAppInSettings` → `woWhatsAppInSettings`
- [x] `pi_ready` → `wo_ready`
- [x] `ispi` → `isWo` (ClawMissionView)
- [x] `piRequested` → `woRequested`
- [x] `piMissingStrict` → `woMissingStrict`
- [x] `piSoftNoCli` → `woSoftNoCli`
- [x] `piRequestedButNotDriving` → `woRequestedButNotDriving`

### Function Renames
- [x] `piExtensionShimRef` → `woExtensionShimRef`
- [x] `mergePiSettingsExtensionsArray` → `mergeWoSettingsExtensionsArray`

### Bulk Label Replacement (Code Files)
- [x] "Pi engine" → "Wo engine"
- [x] "Pi CLI" → "Wo CLI"
- [x] "Pi TUI" → "Wo TUI"
- [x] "Pi runtime" → "Wo runtime"
- [x] "Pi tools" → "Wo tools"
- [x] "Pi JSON" → "Wo JSON"
- [x] "Pi assistant" → "Wo assistant"
- [x] "Pi agent" → "Wo agent"
- [x] "Pi extensions" → "Wo extensions"
- [x] "Pi skills" → "Wo skills"
- [x] "Pi Coding Agent" → "Wo Coding Agent"
- [x] "Pi turn/turns" → "Wo turn/turns"
- [x] "Pi's" → "Wo's"

## Remaining Work

### High Priority — Nuanced Label Fixes
- [ ] `ClawHelpModal.tsx` — ~20 remaining "Pi" references in help text (describing ecosystem)
- [ ] `ClawMissionView.tsx` — engine status labels ("Pi required", "Pi idle", "Pi is installed", "Pi drives chat", etc.)
- [ ] `SimpleModelsView.tsx` — model config text ("Pi workspace JSON", "Pi TUI", "headless Pi", "pi.config.json")
- [ ] `ClawChannelsView.tsx` — Telegram/WhatsApp setup labels ("Pi checklist OK", "pi-telegram", "pi-whatsapp")
- [ ] `TechnicalSidePanels.tsx` — `.wo/settings.json` editor UI references
- [ ] `SimpleChatView.tsx` — comment about ".wo/agents/claw.md"
- [ ] `ClawHelpModal.tsx:497-498` — "headless Pi path", "Pi driving chat" references
- [ ] `ClawMissionView.tsx:115,234` — `strictPi` variable (value check against "pi" string)
- [ ] `ClawSchedulesView.tsx` — "Pi is ready" label, "The instruction Pi will receive"
- [ ] `ClawChannelsView.tsx` — "Live messaging runs inside Pi", "Run /reload in Pi"
- [ ] `dockToolAddMenu.tsx` — "Pi agent-team roster", "Pi tools"
- [ ] `SimpleNavRail.tsx` — comment about "not Pi dispatch_agent orchestration"
- [ ] `ContextUsageRing.tsx` — comment "Pi-style context window fill"

### Server Files
- [ ] `server/agent-runtime.ts` — remove no-op functions (authoritativeRuntimeEnabled, shouldUsePiJsonChat, runPiChatTurn, etc.)
- [ ] `server/diagnostics.ts` — remove `WOP_WO_BINARY` diagnostic (or keep as `woBinary`)
- [ ] `server/web-manifest.ts` — remove `woDrivesRuntime: false` (line 29, 84)
- [ ] `server/index.ts` — remove `_bootWoDrives` and `woDrivesChat=$(…)` from banner
- [ ] `server/ws-handler.ts` — remove `if (useAuthRt)` dead branch (lines 334-351)
- [ ] `server/claw-schedule-executor.ts` — remove `authoritativeRuntimeEnabled()` dead guard
- [ ] `server/claw-automation-status.ts` — remove `woAutomationReady` field
- [ ] `server/routes/config.ts` — remove `woDrivesChat` POST handler (dead)
- [ ] `server/orchestrator-tools-exec.ts` — remove `executeToolViaRuntime()`, `isRuntimeToolExecutionEnabled()`
- [ ] `server/sdk-runtime.ts` — fix comments referencing "old pi SDK"
- [ ] `server/claw-scheduler.ts:3` — fix comment
- [ ] `server/session-prompts.ts` — remove WOP_CHAT_ENGINE=auto, pi from prompt
- [ ] `server/chat-context-budget.ts` — remove Prefer WOP_CHAT_ENGINE=pi comment

### Shared Files
- [ ] `shared/claw-telegram-status.ts` — remaining Pi refs in comments/types
- [ ] `shared/claw-whatsapp-status.ts` — remaining Pi refs in comments/types

### File Rename
- [ ] Rename `src/utils/piSettingsJson.ts` → `src/utils/woSettingsJson.ts` + update all imports
- [ ] Check `src/constants/piModelConfigPaths.ts` → rename if needed

### Documentation
- [ ] `docs/DEAD_CODE_PI_RUNTIME.md` — update to reflect current state (some items done)
- [ ] `docs/CLAW.md` — remaining Pi references
- [ ] `.env` / `.env.example` — remove `WOP_PI_BINARY`, update `WOP_CHAT_ENGINE` docs
- [ ] `electron/electron-main.mjs` — "which pi" comment
- [ ] `electron/electron-main.mjs` — "wayof-pi.code-workspace" default name
- [ ] Other doc files with Pi references

### Verification
- [ ] TypeScript compile check (`bun run build` or `tsc -b --noEmit`)
- [ ] Test that Claw/Simple views render without broken references

## Risks
- **High:** The API field rename (piDrivesChat→woDrivesChat) is a breaking change — any clients consuming the old field names will break.
- **Mitigation:** This is a local-first application; the web UI is the primary consumer.
- **Medium:** File renames (piSettingsJson.ts) could break imports temporarily.

## References
- `docs/DEAD_CODE_PI_RUNTIME.md` — full dead code inventory
- `docs/ORCHESTRATOR_TOOL_EXECUTION_BUG.md` — the bug that triggered this cleanup
