# [WOW-051] Navbar Lagginess — Double Navigation & Throttled Mode Switching

## Problem Statement

The navbar (`UiModeToggle.tsx`) is laggy and unresponsive. Users often need to click buttons multiple times before the correct page appears. The navbar feels sluggish and unpredictable.

## Desired Outcome

Each navbar button click produces an immediate, single navigation to the correct page with no lag, no flicker, and no need to click twice.

## Context & Background

### Root Cause: Double-navigation pattern in mode buttons

All mode-based buttons (Simple, Claw, Docs, Workboard, Kanban, TA-Planner, ÄTA) followed this pattern:

```tsx
onClick={() => {
    if (window.location.pathname !== "/") navigate("/", { replace: true });
    onUiModeChange("docs");
}}
```

This triggered **three `history.replaceState` calls** in rapid succession:
1. `navigate("/", { replace: true })` — navigates to `/`
2. Route `/` has `<Navigate to="/simple" replace />` — immediately redirects to `/simple`
3. `UiModeWatcher` effect detects `uiMode` changed + path (`/simple`) doesn't match target → `navigate("/docs", { replace: true })` — navigates to the real target

### Console Evidence

When clicking a navbar button, Chrome DevTools Console showed:

```
Throttling navigation to prevent the browser from hanging.
See https://crbug.com/1038223. Command line switch for this
purpose: --disable-ipc-flooding-protection.
```

Stack trace from the throttled navigation pointed to `UiModeWatcher`:

```
replace2 @ react-router-dom.js?v=2905f768:766
(anonymous) @ react-router-dom.js?v=2905f768:6352
(anonymous) @ App.tsx:61
```

Line `App.tsx:61` is `navigate(expectedPath, { replace: true })` inside the `UiModeWatcher` `useEffect`. The massive React commit trace showed `UiModeWatcher` being invoked repeatedly during the passive-effect mount phase, with the associated `/api/opticat/*` data fetches re-firing on each cycle (the OptiCat dashboard page re-mounting from the `/simple` → `/docs` redirect chain).

### Secondary issues

- Brief UI flash as React renders `/simple` before `UiModeWatcher` redirects to the real target
- `UiModeWatcher` at `App.tsx:50-66` couples mode state to URL state, creating unnecessary cycles
- Users click multiple times when nothing seems to happen → each click queues more navigations → throttle kicks in → page becomes unresponsive
- Massive React commit waterfall: redirect chain causes full re-mount of page components, re-firing all data fetches

### Why the fix works

The `UiModeWatcher` component already handles navigation when `uiMode` context state changes. The `navigate("/")` in button handlers was redundant:

```tsx
// Before (broken — 3 history.replaceState calls):
onClick={() => {
    if (window.location.pathname !== "/") navigate("/", { replace: true });
    onUiModeChange("docs");
}}

// After (single navigation via UiModeWatcher):
onClick={() => onUiModeChange("docs")}
```

Flow after fix:
- `onUiModeChange("docs")` → `setUiMode("docs")` in `RefactorContext`
- `UiModeWatcher` effect fires: `uiMode = "docs"`, `expectedPath = "/docs"`, `pathname = "/current-page"` → mismatch → single `navigate("/docs", { replace: true })`
- `RouteSync` sees path `/docs`, sets mode to `"docs"` (already correct, no-op)
- Done. One navigation. No redirect chain.

### Comparison with working buttons

Admin, SuperAdmin, Portal, Client, Profile, and OptiCat buttons use direct `navigate("/target", { replace: true })` — single navigation, no lag, always works. These bypass the mode-change/double-navigation pattern entirely.

### Why This Matters

The navbar is the primary navigation mechanism. Laggy or unreliable navigation degrades the entire user experience and erodes trust in the platform.

## Fix Applied

### Changes

| File | Change |
|---|---|
| `src/components/UiModeToggle.tsx` | Removed `navigate("/", { replace: true })` from all 7 mode button `onClick` handlers |
| `vite.config.ts` | Added `/opticat/vnc/` proxy rule → `http://127.0.0.1:3333` (VNC viewer fix) |

### What was removed from each button

- **Simple** button (line 49): removed `navigate("/")` guard
- **Claw** button (line 61): removed `navigate("/")` guard
- **Docs** button (line 75): removed `navigate("/")` guard
- **Workboard** button (line 87): removed `navigate("/")` guard
- **Kanban** button (line 99): removed `navigate("/")` guard
- **TA-Planner** button (line 111): removed `navigate("/")` guard
- **ÄTA** button (line 123): removed `navigate("/")` guard

Each now just calls `onUiModeChange("mode")` directly.

## Requirements

### Functional Requirements
- [x] All navbar buttons navigate to the correct URL in a single navigate — no intermediate `/` navigation
- [x] `onUiModeChange()` is still called to set mode state; `UiModeWatcher` navigates
- [x] `UiModeWatcher` navigation guard is a no-op when URL already matches mode
- [x] No Chrome "Throttling navigation" warnings during normal use
- [x] No visible UI flicker when switching between modes

### Out of Scope
- Rewriting the entire navigation architecture or routing library
- Changing the `RouteSync` component behavior
- Addressing StrictMode double-renders (dev-only)
- Removing `UiModeWatcher` (still needed for URL↔mode sync)

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`

### Manual Verification
- [x] Click each mode button — lands on correct page immediately
- [x] Click buttons rapidly (5 clicks in 2s) — no throttle warning in console
- [x] Click OptiCat → lands on `/opticat` dashboard
- [x] Click OptiCatApp → launches VNC viewer (new window), current page unchanged
- [x] Click Admin/SuperAdmin/Portal/Client/Profile — no regression
- [x] No "Throttling navigation" warnings in browser console

## Technical Notes

### Architecture

Navigation flow:

```
Button onClick → onUiModeChange("X")
    → setUiMode("X") [RefactorContext]
    → UiModeWatcher useEffect
        → navigate("/x", { replace: true }) [react-router-dom]
        → RouteSync useEffect
            → setUiMode("x") [already set, no-op]
```

### Affected Components
- `src/components/UiModeToggle.tsx` — 7 button handlers fixed
- `src/App.tsx:50-66` — `UiModeWatcher` unchanged (handles navigation)
- `src/hooks/useUiMode.ts` — no change needed
- `vite.config.ts` — added `/opticat/vnc/` proxy rule

### Related VNC White Screen Issue

The VNC viewer white screen (independent but discovered during testing): Vite (`:5173`) had no proxy for `/opticat/vnc/`, so requests through ngrok (→ Vite) served the React SPA `index.html` instead of the noVNC viewer HTML. Fixed by adding proxy rule in `vite.config.ts`.

---

## Meta

**Created**: 2026-06-05
**Updated**: 2026-06-05 — fix applied: removed `navigate("/")` from all 7 mode button handlers; added VNC proxy rule
**Priority**: High
**Estimated Effort**: S
**Status**: Fixed
