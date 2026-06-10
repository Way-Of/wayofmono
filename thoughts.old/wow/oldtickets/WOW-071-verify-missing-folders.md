# WOW-071-verify-missing-folders

## Problem Statement

The current process of updating agents with folder information is reactive. We need a proactive verification step to ensure no required folders are missed across all agents responsible for file creation or storage.

## Desired Outcome

A confirmed, consistent, and complete list of all necessary folders for document storage across all relevant agents, ensuring all agents are correctly configured to use them and that this configuration accurately reflects the actual `workspace/dokument` structure.

## Context & Background

### Current State
The `Docs` agent (`.wo/agents/docs.md`) and other document-handling agents (`.wo/agents/fakturering.md`, `.wo/agents/projektledare.md`) have recently been updated with file naming and folder organization rules. However, there's no systematic check to ensure that all agents that create or store files are aware of all relevant document storage folders, and that these lists are consistent.

### Why This Matters
Inconsistent or incomplete folder information in agent configurations can lead to several issues:
- **Misfiled Documents**: Agents might store documents in incorrect or default locations, making them hard to find.
- **Data Inconsistencies**: Different agents might operate with different understandings of the correct folder structure.
- **Inefficient Workflows**: Users might need to manually move or correct documents, reducing the efficiency gained from agent automation.
- **Compliance Risks**: Documents not stored in designated locations might not adhere to organizational policies or regulatory requirements.

## Requirements

### Functional Requirements
- [ ] Systematically identify and review all agents within the `.wo/agents/` directory that handle file creation or storage operations.
- [ ] For each identified agent, extract the list of document storage folders specified in its prompt or configuration.
- [ ] Compare these extracted folder lists against the actual directory structure present under `/home/zerwiz/CodeP/wayofwork/workspace/dokument`.
- [ ] **Proactively verify that all identified agents have explicit instructions to follow the project's File Naming Rules (as defined in `workspace/dokument/Admin/File Naming Rules.md`) when creating or renaming files.**
- [ ] Identify any discrepancies, omissions, or inconsistencies in the folder configurations or naming rule adherence across agents or between agent configurations and the actual file system.
- [ ] If discrepancies are found, propose and implement updates to the relevant agent configurations (`.wo/agents/*.md`) to ensure accuracy, consistency, and compliance with both the folder structure and naming policy.

### Out of Scope
- Automatic creation or deletion of folders in the file system.
- Refactoring the core file handling logic within agents.
- Modifying the `workspace/dokument` directory structure itself, unless explicitly approved by a separate ticket.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build` (Ensures no syntax errors in agent configs if they are part of a build process)

### Manual Verification
- [ ] A consolidated list of all document storage folders used by agents is created and verified against the physical `workspace/dokument` structure.
- [ ] Each agent identified as handling file creation/storage has a consistent and complete list of document storage folders in its prompt/configuration, reflecting the `/home/zerwiz/CodeP/wayofwork/workspace/dokument` structure.
- [ ] **Each identified agent is explicitly instructed to follow the File Naming Rules policy defined in `workspace/dokument/Admin/File Naming Rules.md` and this adherence is verified.**
- [ ] No agent attempts to store files in undocumented locations or use non-compliant filenames based on its configuration.

## Technical Notes

### Affected Components
- `.wo/agents/*.md` - Agent prompt files will be reviewed and potentially updated to correct folder lists and enforce naming policy.
- `/home/zerwiz/CodeP/wayofwork/workspace/dokument/` - The actual folder structure will be used as the authoritative reference.
- `workspace/dokument/Admin/File Naming Rules.md` - Authoritative reference for file naming policy.
- `CHANGELOG.md` - Will be updated to reflect any changes made to agent configurations.

---

## Meta

**Created**: 2026-06-06
**Priority**: Medium
**Estimated Effort**: M
