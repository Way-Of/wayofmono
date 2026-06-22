---
name: init_harness
description: >-
  Initialize the AI Engineering Harness in a repository by running the tool's
  project memory init, then cloning the shared f-rr-d thoughts repo and setting
  up the standard directory structure. The f-rr-d repo is append-only — never
  delete, rename, or move anything inside thoughts/.
disable-model-invocation: true
allowed-tools: read, write, bash
---

# Initialize Harness

Initialize the AI Engineering Harness in this repository.

## What This Command Does

1. Runs the tool's project memory init to generate project memory file
2. Discovers all installed skills and commands and writes them into the project memory file
3. Clones the shared `f-rr-d` repo into `thoughts/` with full branch tracking
4. Verifies project directories exist for each configured project

## Examples

```bash
# Initialize harness with default settings
/init_harness

# Interactive mode — customize what gets generated
/init_harness --interactive
```

## Safety

- The f-rr-d repo is **append-only** — never delete, rename, or move anything inside `thoughts/`
- Creates directory structure but never destroys existing content
- All writes are additive (new files only)
