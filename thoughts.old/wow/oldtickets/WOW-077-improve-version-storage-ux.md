# WOW-077-improve-version-storage-ux

## Problem Statement

The "Version Storage" section within the Admin page of Way of Work uses developer-centric and technical terminology (e.g., "personal access token," "Git User Config," "Git commits," "integrations") that is alienating and confusing for the primary user base—construction workers and project managers who may have no familiarity with Git or version control systems. The current explanations fail to clearly articulate the core value proposition: the secure and auditable saving of critical company data, which is paramount for all users.

## Desired Outcome

The "Version Storage" section is completely revised and simplified, making it intuitive and easily understandable for all Way of Work users, regardless of their technical background. It must clearly communicate:
- The fundamental purpose of securely storing company data (e.g., automatic backups, version history, audit trails).
- The direct benefits to the user and the company (e.g., never lose critical documents, ability to revert to previous versions, compliance with data retention policies).
- The process for connecting and managing this feature in plain, actionable language, abstracting technical complexities wherever possible.
- The emphasis should be shifted from "Git/GitHub" to "Secure Company Data Storage and Versioning."

## Context & Background

### Current State
The existing "Version Storage" UI and its accompanying text predominantly rely on Git/GitHub concepts, which are foreign to many users. The descriptions focus on developer-oriented actions ("Connect Version Storage (personal access token)", "Git User Config", "team or org workflows ready for upcoming integrations") rather than the practical, secure data management value that is central to Way of Work's offering for its users.

### Why This Matters
Secure data storage, versioning, and reliable backup are **CRITICAL** for any modern business, especially in the construction sector where large volumes of plans, contracts, and financial documents are managed. If Way of Work users do not understand, trust, or feel comfortable interacting with the "Version Storage" feature due to technical jargon, it leads to:
- **Underutilization:** Users may not enable or actively use the feature, missing out on crucial data protection.
- **Data Loss Risk:** Increased potential for irreversible data loss if backups are not understood or correctly configured.
- **Compliance Issues:** Difficulty in meeting regulatory and contractual requirements for data retention and auditability.
- **User Frustration:** Confusion and perceived complexity diminish the overall user experience and trust in the platform's capabilities.
- **Misaligned Perception:** The feature is seen as a developer-only tool rather than a core business asset for secure data management.

## Requirements

### Functional Requirements
- [ ] **Plain Language Explanations:** Rewrite all text, labels, prompts, and descriptions within the "Version Storage" section using simple, accessible language. Eliminate or clearly explain any technical jargon (e.g., replace "personal access token" with "secure connection code" and provide clear instructions on how to obtain it, if unavoidable).
- [ ] **Emphasize Data Security & Backup:** Clearly articulate that "Version Storage" is a robust system for:
    - Automatically backing up all critical company data (documents, project plans, reports, communication logs).
    - Providing a historical record of all changes, creating an immutable audit trail.
    - Ensuring data integrity and recoverability.
- [ ] **Benefits Articulation:** Explicitly describe the practical benefits for the user in their day-to-day work (e.g., "never accidentally lose a document version," "easily restore previous plans," "track who changed what and when for accountability").
- [ ] **Simplified Connection Process:** Re-evaluate and streamline the "Connect Version Storage" workflow. Provide step-by-step, non-technical guidance. If an external token is required, link directly to instructions on how to generate it from the chosen version storage provider (e.g., GitHub, GitLab).
- [ ] **"Git User Config" Clarity:** Rename and explain "Git User Config" in terms of authorship and traceability. For example, "Identify Changes" or "Change Author" with an explanation like "This name and email will be recorded with every change the system makes, helping you track who initiated updates."
- [ ] **Visual Cues & Status:** Implement clear visual indicators of connection status and last successful backup.
- [ ] **User Feedback Integration:** Consider integrating a mechanism for users to easily understand *what* data is being backed up and *when* it was last securely saved.

### Non-Functional Requirements
- [ ] **Usability:** The redesigned section must be intuitive and easy to use for all workers, regardless of their technical proficiency.
- [ ] **Clarity:** All explanations and instructions must be unambiguous and leave no room for misinterpretation.
- [ ] **Security:** The underlying security of the version storage integration must remain uncompromised and ideally reinforced in user messaging.

### Out of Scope
- Changing the underlying Git or version control integration. This ticket is strictly focused on the user experience, terminology, and explanatory content presented in the UI.
- Implementing support for new version control systems.
- Major UI/UX redesign of the entire Admin dashboard beyond the "Version Storage" section itself.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`.
- [ ] UI tests ensure all text changes are rendered correctly and without errors.

### Manual Verification
- [ ] A non-technical user (e.g., a simulated construction worker or project manager) can easily understand the purpose and benefits of "Version Storage" without developer assistance.
- [ ] All technical jargon related to Git/GitHub is either removed or explained clearly in simple terms.
- [ ] The section primarily emphasizes secure data saving, backup, and version history, rather than technical integration details.
- [ ] The process for connecting and configuring is simplified and user-friendly.
- [ ] The "Git User Config" fields are renamed or explained in terms of change authorship.

## Technical Notes

### Affected Components
- `src/components/settings/VersionStorageManageSettingsCard.tsx` - Primary UI component to be revised.
- `src/pages/DocsApp.tsx` - Where "Save Version" / "Version History" buttons appear, may need corresponding text adjustments.
- `.wo/agents/` - Review agent prompts that interact with versioning to ensure consistent terminology.
- `CHANGELOG.md` - Will be updated to reflect this UX improvement.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
