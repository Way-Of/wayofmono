---
name: engineering_retro_loop
description: Close a Way-Of engagement (new build or port) by recording outcomes and improving the method. Use at the end of a port or build, when a lesson should become a rule, when the playbook should be pruned, or when feeding lessons back into the CoE skills. Records scored notes to Anchor and retires rules that cannot move the outcome.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# The retro loop

The method improves only if closing work is part of the work. This skill turns an engagement into scored playbook rules and retires the ones that do not earn their place.

## Steps

1. **Collect outcomes.** For each playbook rule used this engagement: did it change the outcome? Record effect (helped / neutral / hurt), an interval or magnitude where possible, and the evidence (test, metric, incident).
2. **Write to Anchor.** One note per decision or rule, `anchor = way-of/<project>`, `type = decision` or `invariant`, concise, with the rejected alternative. Use the `anchor-memory` skill or `POST /api/note`.
3. **Score the playbook.** Update `playbook/library.json`: each rule has `id`, `action`, `source`, `effect`, `trials`, `evidence`. Rules with `effect: neutral` and enough trials are **retired** (moved to `retired`, not deleted).
4. **Feed the skills.** A lesson that generalises edits the relevant SKILL.md; a project-specific lesson stays in Anchor and the project's AGENTS.md. Do not bloat the skills with one-off detail.
5. **Record the retro.** One file per engagement under `playbook/retros/<date>-<project>.md`.

## Rules

- **A rule must be able to die.** If nothing could ever retire it, it is a value, not a rule; put it in `engineering-coe` non-negotiables instead.
- **Interleave, do not block.** Score rules across engagements in parallel, not in runs; a blocked design measures drift (the Runa compounding lesson).
- **Keep the digest.** `playbook/library.json` carries a content digest so an engagement can name the exact playbook version it was judged against.

## Retro template

```markdown
# Retro: <project> (<date>)
## What we built (one paragraph)
## Outcomes per rule   (rule id -> effect -> evidence)
## Retired rules        (id, why it could not move the outcome)
## New rules proposed   (action, why, how it will be scored)
## Debts and open risks
## Skills changed       (which SKILL.md, what changed)
```
