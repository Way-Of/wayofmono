# Plan: Preserve Local Work & Get New npm Package to main

**Status:** DRAFT — findings in progress
**Created:** 2026-08-30
**Context:** Two previous agents crashed while attempting this work. Document written incrementally to persist findings across possible crashes.

---

## 1. Goal

1. **Get the new npm package** into the WayOfMono repo so it can be merged with `main`.
2. **Avoid the crashes** that killed two prior agents (root cause is almost certainly the massive dirty/divergent state of the working tree).

---

## 2. Current Repository State (Findings)

### 2.1 Git Branches
- Currently checked out: **`feature/preserve-local-work-v2`**
- Other local branches: `feature/preserve-local-work`, `main`, `v40`, **`w1`**
- `w1` branch exists both locally and on `origin` (`remotes/origin/w1`)

### 2.2 `w1` branch — WHY AGENTS CRASH
- `w1` contains a **catastrophically large diff** vs `main`:
  - **45,453 files changed**, **429,787 insertions**, **7,829,991 deletions**
- Two commits added on top of `main`:
  - `01da2c45 chore: add all project files`
  - `5e333100 merge: resolve conflicts by keeping our version`
- `main` IS an ancestor of `w1` (`git merge-base main w1` = `97c66c55`, which is the current `main` HEAD).
- The `w1` branch appears to be a botched "add everything" branch that deleted huge portions of the repo (7.8M lines deleted, including all of `ui/`, `skills/`, etc.).

**Conclusion:** `w1` is **not safe to merge** and is the likely trigger for agent crashes. It should NOT be merged to main.

### 2.3 Current Working Tree (branch `feature/preserve-local-work-v2`)
Lots of **untracked** local work that must be preserved:
- `$(pwd)/` — junk dir (accidentally created, was committed in a prior commit then removed — see `8280fb36 chore: remove accidentally-committed junk ($(pwd)/ pnpm store, home/ dir)`)
- `.pi/`
- `codex-output/`
- `docs/` — many new docs (HARNESS_TUTORIAL.md, INSTALL.md, PORTING-INVENTORY.md, agents/, archetecture/, packages/, skills/, tools/ai-coding-tools/, wo/)
- `packages/@aiengineeringharness/` — **NEW NPM PACKAGE?** (see section 3)
- `packages/@wayofmono/web-access/banner.png`
- `packages/@wayofmono/wo-agent/src/core/export-html/template.js` + `vendor/`
- `packages/@wayofmono/wo-agent/src/utils/pi-user-agent.ts`
- `packages/@wayofmono/wo-coding-agent/src/core/export-html/template.js` + `vendor/`
- `packages/@wayofmono/wo-coding-agent/src/utils/pi-user-agent.ts`
- `skills/`
- `start.sh`
- `thoughts.old/`
- `ui/`

### 2.3b `w1` PUSH STATE — STUCK BEHIND origin/w1
- `git rev-list --left-right --count origin/w1...w1` → **`0  416`**
  - Interpretation: `origin/w1` is **416 commits AHEAD** of local `w1` (or local `w1` is behind). w1 push is **stuck / out of sync** with `origin/w1`.
- `w1@{upstream}` resolves (branch tracks `origin/w1`), but the local `w1` and `origin/w1` have **diverged**.
- w1 local tip: `5e333100 merge: resolve conflicts by keeping our version` (this is the "keep our version" merge that deleted 7.8M lines).
- This divergence is why a `git push origin w1` would be rejected (non-fast-forward) and could appear "stuck."

**Recommendation:** Do NOT try to force the w1 push. w1 is destructive and should be abandoned as the merge vehicle.

### 2.4 pnpm workspace config (VERIFIED)
Root `pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/@wayofmono/*"
allowBuilds:
  '@google/genai': true
  esbuild: true
  koffi: true
  protobufjs: true
```
- **Workspace glob ONLY includes `packages/@wayofmono/*`.**
- **`packages/@aiengineeringharness/` is NOT in the workspace glob.**
- Root `package.json` has **no** `workspace` key and **no** reference to `aiengineeringharness` (verified via Select-String).

⚠️ **Implication:** If `@aiengineeringharness` is meant to be a workspace npm package, it must be **added to `pnpm-workspace.yaml`** (e.g. add `"packages/@aiengineeringharness/*"`).

### 2.4b `@aiengineeringharness` structure (VERIFIED)
- **No `package.json` anywhere** under `packages/@aiengineeringharness/` (checked recursive depth 2).
- Subdirectories: `.github`, `antigravity`, `claude`, `codex`, `docs`, `gemini`, `opencode`, `pi`, `scripts`, `thoughts`, `wocoder`
- This is a **full per-tool AI Engineering Harness** (all 7 frontends: antigravity, claude, codex, gemini, opencode, pi, wocoder).
- **It is currently a directory of skills/agents/commands, NOT a publishable npm package** (no package.json).

⚠️ **This may or may not be the "new npm package."** Since it lacks package.json and is not in the workspace, it does not currently meet the definition of an npm package.

### 2.4c Packages directory
Tracked (committed) packages: `@wayofmono`, `delivery-opticat`, `delivery-womono`, `delivery-wow`

**Entire `packages/@wayofmono/*` set appears untracked in git** (all 28 dirs) — meaning the currently committed `packages/@wayofmono` in git is different/older, and the local `packages/@wayofmono` is a large untracked overlay.

`packages/@aiengineeringharness/` is **entirely untracked** — a full AI Engineering Harness copy (codex/, gemini/, opencode/, pi/, wocoder/, scripts/, thoughts/, docs/skills/). This is the prime candidate for the "new npm package" the user wants to publish.

---

## 3. THE NEW NPM PACKAGE — CONFIRMED: `@wayofmono/wayofteams-tools`

User confirmed: **"the new packet are the wayofteams tools to pi"**

### 3.1 Published package (SAFE — NOT LOST)
- Published on npm as **`@wayofmono/wayofteams-tools` version `0.1.3`**
- Installed in Pi: `C:\Users\josef\.pi\agent\npm\node_modules\@wayofmono\wayofteams-tools`
- Contents: `dist/`, `src/`, `LICENSE`, `package.json`, `README.md`
- `package.json`:
  - name: `@wayofmono/wayofteams-tools`, version `0.1.3`, type: `module`
  - desc: "pi extension: full WayOfTeams MCP integration (legacy + v2 domain-split) with REST dual path, client-first, per-user JWT"
  - `pi.extensions: ["./src/index.ts"]`
  - main/types: `dist/index.js` / `dist/index.d.ts`
  - peerDeps: `@earendil-works/pi-*`, `typebox`
  - repo: `git+https://github.com/Way-Of/wayofmono.git`
- **Published npm packages are intact** — verified `npm view`:
  - `@wayofmono/wo-agent` → 1.0.13
  - `@wayofmono/wo-coding-agent` → 1.0.25
  - `@wayofmono/wo-agent-core` → 1.0.9
  - `@wayofmono/wayofteams-tools` → 0.1.3
  - **Conclusion: the published npm files were NOT lost.**

### 3.2 SOURCE LOCATION (the real task)
The package **source** is NOT in the `C:\wayofmono` working tree and NOT in git history.
It lives in a **separate checkout of the same repo**:

- **`C:\CodeP\womono`** — a git checkout of `https://github.com/Way-Of/wayofmono`
  - Branch `main`, HEAD `9e49fa18` (same as `C:\wayofmono` HEAD)
  - **Untracked new work present there:**
    - `packages/@wayofmono/wayofteams-tools/` (the full package source)
    - `.changeset/wayofteams-tools-new.md` (changeset for release)
    - `docs/updates/`
  - Modified: `CHANGELOG.md`, `README.md`
  - Note: `C:\CodeP\womono` does NOT contain all the other untracked junk that `C:\wayofmono` has (no `$(pwd)/`, `thoughts.old/`, `codex-output/`, `ui/`, `skills/`, `@aiengineeringharness/`).

### 3.3 Two checkouts of the SAME repo
| | `C:\wayofmono` (this workspace) | `C:\CodeP\womono` |
|---|---|---|
| Remote | `github.com/Way-Of/wayofmono` | `github.com/Way-Of/wayofmono` |
| HEAD | `9e49fa18` | `9e49fa18` |
| Branch | `w2` (started) | `main` |
| New package source | ❌ absent | ✅ present (untracked) |

**Key insight:** The wayofteams-tools package source only exists untracked in `C:\CodeP\womono`. To get it to main we must copy it from there into a branch in `C:\wayofmono` (or work directly in `C:\CodeP\womono`).

### 3.4 pnpm workspace
Root `pnpm-workspace.yaml` glob is `packages/@wayofmono/*` — so `wayofteams-tools` under `packages/@wayofmono/` will be picked up automatically once added. No workspace config change needed (unlike the non-workspace `@aiengineeringharness`).

---

## 4. Open Questions / Decision Points

1. ~~Is `w1` to be abandoned?~~ **YES — confirmed.** w1 is destructive (7.8M line deletions), diverged from `origin/w1` (416 behind), and its push is stuck. It is NOT the merge vehicle.
2. ~~What is the new npm package?~~ **CONFIRMED: `@wayofmono/wayofteams-tools` (WayOfTeams tools for Pi).**
3. **Which checkout to work from?** Recommend `C:\CodeP\womono` (has the source) OR copy source into `C:\wayofmono` branch `w2`. User asked: "we can use local files or w1 to cherry-pick files to copy to main" — so they're open to copying.
4. **How to get source into main cleanly:** Create a fresh branch off `main`, add `packages/@wayofmono/wayofteams-tools` + `.changeset/` + `docs/updates/` + CHANGELOG/README updates, commit, push, PR → main.
5. **pnpm store** — a prior agent called it "trash" and deleted it. It is NOT part of the repo and should not be committed; deleting only means re-downloading deps. Verify nothing essential lost (published packages are safe on npm).

---

## 5. Proposed Approach (Next Steps)

1. **Stop using `w1`.** Do not merge it, do not force-push it. Stuck push processes (Zed/opencode `git update-index`) have been killed to unblock the repo.
2. **Source is in `C:\CodeP\womono`** — copy the untracked package + changeset + docs from there.
3. **Create a clean branch off `main`** in `C:\wayofmono` (e.g. `feat/wayofteams-tools-pi`).
4. **Copy** `packages/@wayofmono/wayofteams-tools/`, `.changeset/wayofteams-tools-new.md`, `docs/updates/`, and CHANGELOG.md/README.md edits into the new branch.
5. **Add package to workspace** — no config change needed (`packages/@wayofmono/*` glob already covers it).
6. **Stage ONLY intended paths** (NOT junk like `$(pwd)/`, `thoughts.old/`, `codex-output/`, `ui/`, `skills/`).
7. **Commit** with a clear message referencing WOW-001 / WayOfTeams.
8. **Push + open PR → main.**
9. **Merge to main** (after review + tests).

### IMPORTANT: What NOT to stage in `C:\wayofmono`
The `C:\wayofmono` working tree has lots of unrelated untracked junk. When committing the package, use **targeted `git add <paths>`** — never `git add .` / `-A`.

## 5b. Pending verification / next actions
- [x] Read `C:\CodeP\womono\packages\@wayofmono\wayofteams-tools\src\index.ts` → confirmed pi extension entry point (src/ has 12 files: client/mcp.ts, client/rest.ts, tools/control.ts, tools/fallbacks.ts, tools/router.ts, config, identity, registry, schema, server, token, index)
- [x] Read `.changeset/wayofteams-tools-new.md` → minor changeset, "New @wayofmono/wayofteams-tools pi extension/package — full WayOfTeams MCP integration (legacy /mcp + v2 domain-split) with a REST dual path. Client-first: per-user JWT. Installs via `pi install npm:@wayofmono/wayofteams-tools`."
- [x] Check CHANGELOG diff → **1.8.0 - 2026-08-29**, wayofteams-tools v0.1.0, ticket WOTEAMS-547, plan at `docs/mcp/PI-WAYOFTEAMS-EXTENSION-PLAN.md`
- [x] Check README diff → adds "pi Extensions" section + `@wayofmono/wayofteams-tools` to Packages table
- [x] `docs/updates/` → context-mode-integration-plan.md, pi-dev-reference-guide.md, WOMONO-181 files (related but separate; review whether to include)

### EXACT FILES TO BRING TO MAIN (from `C:\CodeP\womono`)
1. `packages/@wayofmono/wayofteams-tools/` (45 files excluding node_modules)
2. `.changeset/wayofteams-tools-new.md`
3. `CHANGELOG.md` (1.8.0 entry)
4. `README.md` (pi Extensions section + packages table row)
5. `docs/updates/` (review — 4 files, may or may not belong with this change)

- [ ] Decide checkout strategy: copy into `C:\wayofmono` w2 branch (recommended)

---

## 6. Crashes Prevention Notes

- Avoid running commands that traverse the whole 45k-file diff (e.g. `git diff main w1` full, `git status` on giant trees repeatedly).
- Use targeted pathspecs (`git add packages/@aiengineeringharness`) instead of `git add .` or `git add -A`.
- Do NOT merge `w1`.
- Consider ignoring junk dirs.

---

## 7. Change Log (of this doc)
- 2026-08-30: Created. Captured git state, w1 crash diagnosis, untracked inventory, package candidate identification.