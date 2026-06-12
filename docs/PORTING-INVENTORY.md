# Porting Inventory & Synthesis Plan

This document details the status of all features and packages being synthesized from reference projects (`ref/`) into the **WayOfMono** monorepo.

## 📦 Core Framework Synthesis (Pi → Wo)

We are remaking the official Pi core framework as our own **Wo** (Way of Coding) implementation.

| Feature | Original (Pi) | **Target (Wo)** | Strategy | Status |
| :--- | :--- | :--- | :--- | :--- |
| **LLM API** | `@earendil-works/pi-ai` | **`@wayofmono/wo-ai`** | Rebrand + Tweak | 🟡 In-Progress |
| **Agent Runtime**| `@earendil-works/pi-agent-core` | **`@wayofmono/wo-agent-core`** | Rebrand + Tweak | 🟡 In-Progress |
| **Interactive CLI**| `@earendil-works/pi-coding-agent` | **`@wayofmono/wo-coding-agent`** | Synthesis | 🟡 In-Progress |
| **Terminal UI** | `@earendil-works/pi-tui` | **`@wayofmono/wo-tui`** | Rebrand + Tweak | 🟡 In-Progress |
| **Web UI** | `@earendil-works/pi-web-ui` | **`@wayofmono/wo-web-ui`** | Rebrand + Tweak | 🟡 In-Progress |

---

## 🛠️ Advanced Capability Inventory

| Feature | Source (Reference) | Target Location | Synthesis Strategy | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Wom-Lens** | `ref/pi-lens-master/` | `extensions/wo-lens/` | Deep Synthesis | 🟢 Foundations |
| **Web Tools** | `ref/pi-web-access-main/` | `extensions/wo-web/` | Custom Synthesis | 🟡 Planned |
| **Todo System** | `ref/rpiv-mono-main/` | `extensions/wo-todo/` | Direct Port + Refactor | 🟡 Planned |
| **Worktree** | `ref/ai-engineering-harness-main/` | `wo/commands/wom-worktree.md`| Synthesized | 🟢 Done |
| **Librarian** | `ref/pi-web-access-main/` | `wo/skills/wom-librarian.md` | Synthesized | 🟢 Done |
| **Troubleshooters**| User Example / Synthesis | `wo/skills/troubleshooters/` | Full Synthesis | 🟢 Done |

---

## 🏗️ Technical Synthesis Plans

### 1. The Wo Core remaking
**Objective:** Establish a high-performance, branded CLI binary.
- **Logic:** Port the agent loop from `pi-agent-core`.
- **Branding:** Systematically rename `pi` to `wo` in all tool calls and event emitters.
- **Config:** Update search paths to `~/.wo/agent/`.

### 2. Wom-Lens (The Integrity Engine)
**Objective:** Real-time feedback and safety guards.
- **Components:** `WomTreeSitter`, `WomAstGrep`, `LSPDiscoveryService`.
- **Status:** Foundations built in `packages/@wayofmono/lens`.
- **Next:** Wire into the `wo` core event stream.

### 3. Shared Memory System
**Objective:** Cross-interface context retention.
- **Implementation:** Build a JSONL-backed "Fact Store" in `memory/` accessible via `@wayofmono/wo-agent-core`.

---

## 🚀 Execution Schedule

### Phase 2: Core remaking (Current)
- Complete `@wayofmono/wo-*` package setup.
- Finalize the `wo` CLI binary.

### Phase 3: Advanced Tools (Next)
- Synthesize `wo-web` and `wo-todo` extensions.
- Integrate the high-fidelity `wo-tui`.

### Phase 4: Launch & Documentation
- Rebrand ported documentation from `https://pi.dev/docs/latest`.
- Release the `wo-harness` installer.
