---
name: wom-lens-allow
description: Manually bypass the Wom-Read-Guard for a specific file.
---
# /wom-lens-allow [path]

Grant a one-time exemption to the Wom-Read-Guard for the specified file. This allows the agent to edit the file even if it hasn't been fully read in the current turn.

## Goal
Resolve "Edit Blocked" errors when context was provided through other means or when the file is too large to read fully.

## Constraints
- Exemption only lasts for the next edit operation on the file.
- Use with caution, as editing without reading can lead to code mismatches.
