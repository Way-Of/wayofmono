# WOW-034 [Critical] Back Button Navigation Guard

## Problem Statement

Pressing the browser back button in certain places navigates to the `/login` page instead of going back to the previous page within the application. This is a critical UX bug — users should always go back one step in their application history, never be dumped to the login screen.

**Root cause**:
1. The router has a public `/login` route (`main.tsx:108`) that renders `LoginPage` regardless of auth state
2. The `RequireAuth` wrapper (`main.tsx:110`) only protects `/*` routes — `/login` is unprotected
3. Browser history entries for `/login` are created during initial session (e.g., redirect from `RequireAuth` at `main.tsx:86` uses `replace`, but other flows may push `/login` onto history)
4. The logout button (`UiModeToggle.tsx:172-173`) navigates to `/login` with `replace: true`, but if the user navigated somewhere first and presses back, they may hit `/login` from a prior history entry
5. **`UiModeWatcher`** in `App.tsx:61` uses `navigate(expectedPath, { replace: true })` — every mode switch REPLACES the history entry. Combined with `RootRedirect` also using `replace`, the entire app's history stack is at most 1 entry deep. Pressing back always leaves the SPA.
6. Once at `/login`, there is no redirect back to the app even when the user is authenticated

## Desired Outcome

- Pressing the browser back button **always** goes one step back within the app, never to `/login` or outside the SPA
- If the user somehow lands on `/login` while authenticated, they are immediately redirected to the default app route
- The `/login` route never appears in browser history after initial authentication

## Solution Implemented

### Fix 1: `UiModeWatcher` navigation (primary cause)

Changed `navigate(expectedPath, { replace: true })` → `navigate(expectedPath)` (default push behavior). 

**Why**: `replace: true` made every mode switch (Simple→Kanban→Docs→etc.) overwrite the single history entry. After N switches, the user still only had 1 app page in history. Pressing back once left the SPA. With default push behavior, each mode switch adds a history entry, so pressing back properly walks backwards through the user's navigation within the app.

### Fix 2: `BackButtonGuard` new component

Added a `popstate` event listener that pushes a new `{ __wow_entry: true }` history state when the user reaches the app entry boundary. If the user presses back at the app boundary, instead of leaving the SPA, they are redirected to `/simple`. This is a safety net for cases where the user exhausts all in-app history entries.

### Fix 3: `LoginPage` auth redirect (already present)

`LoginPage.tsx:21-24` already redirects authenticated users away from `/login`:
```tsx
useEffect(() => {
    if (localStorage.getItem("wop_token")) {
      navigate(from || "/simple", { replace: true });
    }
}, []);
```

### Key Files Changed
| File | Change |
|---|---|
| `src/App.tsx:50-65` | Added `BackButtonGuard` component |
| `src/App.tsx:70-80` | Changed `UiModeWatcher` from `replace: true` to default push |
| `src/pages/LoginPage.tsx:21-24` | Auth redirect on mount (already existed) |

## Acceptance Criteria

- [x] Back button from any app page never lands on `/login` or outside the SPA
- [x] If landed on `/login` while authenticated, redirect to `/` immediately
- [ ] Logout still works — user can reach login page after explicit logout
- [x] No changes to `RequireAuth` behavior for unauthenticated users
- [x] `tsc -b --noEmit` passes

## Out of Scope
- The worker/client portal login pages (separate routes, different auth flow)
- Deep-link history management beyond the `/login` guard

---

## Meta

**Created**: 2026-06-02
**Last Updated**: 2026-06-06
**Priority**: Critical
**Estimated Effort**: S
**Depends on**: None
