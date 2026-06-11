---
name: antigravity-config
description: Antigravity configuration expert — knows settings.json, providers, models, packages, keybindings, and all configuration options. Use when the user needs help configuring Antigravity.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

# Antigravity Configuration Reference

Antigravity uses a two-tier settings system where global settings are merged with and overridden by project-specific settings.

## Configuration Locations
- **Global Settings**: `~/.antigravity/settings.json`
- **Project Settings**: `.agents/settings.json` (or `.agents/config.json`)
- **Custom Models**: `~/.antigravity/models.json`
- **Custom Keybindings**: `~/.antigravity/keybindings.json`

---

## Global Settings Schema (`~/.antigravity/settings.json`)

### 1. UI & Display
- `themeMode` — `"dark" | "light" | "system"` (Default: `"dark"`)
- `colorTheme` — Theme preset identifier (Default: `"default"`)
- `dashboardFontScalePct` — Font scaling percentage (Range: `85` to `125`)
- `autoReloadOnVersionChange` — Auto-reload dashboard when client version changes

### 2. Model & Provider Baselines
- `defaultProvider` — Default model provider ID (e.g., `"google"`, `"anthropic"`)
- `defaultModelId` — Default model identifier (e.g., `"gemini-2.5-pro"`, `"claude-3-7-sonnet"`)
- `fallbackProvider` — Backup provider used on transient errors
- `fallbackModelId` — Backup model identifier
- `defaultThinkingLevel` — Reasoning effort level (`"off" | "minimal" | "low" | "medium" | "high"`)
- `favoriteProviders` / `favoriteModels` — Pinned options shown in UI selectors

### 3. Messaging & Daemon
- `daemonHost` — Address daemon binds to (Default: `"127.0.0.1"`, `"0.0.0.0"` to expose)
- `daemonPort` — Daemon port (Default: `4040`)
- `daemonToken` — Secret authentication key for securing CLI connections
- `settingsSyncEnabled` — Enable automatic configuration sync between daemon nodes

### 4. Push & Webhook Notifications
- `ntfyEnabled` / `ntfyTopic` / `ntfyBaseUrl` — Push notifications via ntfy
- `ntfyEvents` — Trigger actions: `["in-review", "merged", "failed", "awaiting-approval", "gridlock"]`
- `webhookEnabled` / `webhookUrl` / `webhookFormat` — Post events to Slack/Discord/custom webhooks

---

## Project Settings Schema (`.agents/settings.json`)

### 1. Scheduler & Concurrency
- `globalPause` — Hard stop: terminates active sessions and blocks scheduling
- `enginePaused` — Soft stop: blocks dispatching new tasks, runs active ones to completion
- `maxConcurrent` — Maximum active execution agents in project workspace (Default: `2`)
- `maxTriageConcurrent` — Maximum concurrent planning agents (Default: `2`)
- `pollIntervalMs` — Scheduler sweep interval in milliseconds (Default: `15000`)
- `taskStuckTimeoutMs` — Timeout after which an inactive executor task is marked stuck
- `maxSpawnedAgentsPerParent` / `maxSpawnedAgentsGlobal` — Concurrency limits for spawned child processes

### 2. Git & Worktrees
- `maxWorktrees` — Maximum Git worktrees allocated (Default: `4`)
- `recycleWorktrees` — Pool and reuse worktree folders for faster boot time
- `worktreeNaming` — Directory folder format: `"random" | "task-id" | "task-title"`
- `worktreeInitCommand` — Bootstrap shell script executed after a worktree is created
- `taskPrefix` — Custom ID prefix for new task cards (Default: `"FN"`)
- `includeTaskIdInCommit` — Prefix commits with task ID (Default: `true`)
- `commitAuthorEnabled` / `commitAuthorName` / `commitAuthorEmail` — Custom git committer identity details

### 3. Workflows & Validation Gates
- `autoMerge` — Squash-merge tasks automatically once PR/verification passes
- `mergeStrategy` — finalization mode: `"direct"` (push to remote) or `"pull-request"`
- `pushAfterMerge` / `pushRemote` — Push branch to origin/main on direct merge
- `testCommand` — Project test script command executed in worktree (hard gate)
- `buildCommand` — Project build command executed in worktree (hard gate)
- `autoResolveConflicts` / `smartConflictResolution` — AI-driven automatic merge conflict fix
- `strictScopeEnforcement` — Fail verification if agent modified out-of-scope files
- `requirePlanApproval` — Block execution until a user approves the generated `PROMPT.md`

### 4. Project-Level Model Overrides
- `defaultProviderOverride` / `defaultModelIdOverride` — Local baseline model
- `planningProvider` / `planningModelId` — Model used by planning agent
- `executionProvider` / `executionModelId` — Model used by executor agent
- `validatorProvider` / `validatorModelId` — Model used by QA/PR review agent
- `modelPresets` — Named custom settings collections map by task size

### 5. Memory & Quantization
- `memoryEnabled` — Enable long-term project memory
- `memoryBackendType` — `"qmd"` (Quantized Distillation, default), `"file"`, or `"readonly"`
- `memoryDreamsEnabled` / `memoryDreamsSchedule` — Schedule daily cron summarization of tasks
- `insightExtractionEnabled` / `insightExtractionSchedule` — Schedule periodic codebase insight scans

### 6. Deep Research
- `researchSettings` — Structured object managing research constraints:
  - `enabled` — Project research toggle
  - `searchProvider` — Brave, Tavily, Google, SearXNG
  - `enabledSources` — `{ webSearch: true, pageFetch: true, github: false, localDocs: true }`
  - `limits` — Max concurrently running research requests, timeout limits, fetch thresholds

### 7. Evaluation & Evals
- `evalSettings` — Scheduled evaluation run parameters

