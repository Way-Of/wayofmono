---
name: github-review
description: "Review GitHub Pull Requests with structured feedback, approval workflow, and CTO Dashboard integration."
allowed-tools: read, write, edit, bash, git, gh
---

# GitHub Review Skill

Handles PR review workflow with structured feedback, approval states, and CTO Dashboard integration.

## Review States

| State | Action | Ticket Status |
|-------|--------|---------------|
| **Pending** | Review requested | Submitted for Review |
| **In Review** | Reviewer starts review | In Review | In Review |
| **Approved** | Reviewer approves | Approved → Done |
| **Changes Requested** | Reviewer requests changes | Changes Requested → In Progress |
| **Rejected** | Reviewer rejects | Blocked |

## Review Comment Format

```markdown
## Review: [Ticket ID]

### Summary
Overall assessment

### Changes Requested
1. **File: path/to/file.ts** - Line 42: Description of issue
   - Suggestion: How to fix

### Questions
- Question about implementation approach?

### Approved Items
- ✅ Good pattern usage
- ✅ Tests cover edge cases
```

## Workflow

### 1. Start Review (Reviewer)

```bash
# Fetch PR, start review
gh pr checkout 123
gh pr view 123 --json files,body

# Set ticket status to "In Review"
# (via ticket-manager update_ticket)
```

### 2. Add Review Comments

```bash
# Add line-specific comments
gh pr comment 123 --body "### Review Comments\n\n1. **src/file.ts:42** - Consider using X instead of Y"
```

### 3. Submit Review Decision

```bash
# Approve
gh pr review 123 --approve --body "LGTM"

# Request Changes
gh pr review 123 --request-changes --body "Please address comments"

# Reject
gh pr review 123 --reject --body "Does not meet requirements"
```

### 4. Update Ticket Status

```bash
# On Approve
update_ticket --ticket_id WOMONO-084 --status "Approved"

# On Changes Requested
update_ticket --ticket_id WOMONO-084 --status "Changes Requested"

# On Reject
update_ticket --ticket_id WOMONO-084 --status "Blocked" --blockers "Review rejected: ..."
```

## Available Tools

### `start_review`
Begin reviewing a PR, update ticket to "In Review".
Parameters:
- `pr_number` (required): PR number
- `ticket_id` (required): Associated ticket ID

### `add_review_comment`
Add structured review comment.
Parameters:
- `pr_number` (required): PR number
- `file_path` (optional): File path for line comment
- `line` (optional): Line number
- `body` (required): Comment text
- `severity` (optional): "critical" | "major" | "minor" | "suggestion"

### `submit_review_decision`
Submit final review decision.
Parameters:
- `pr_number` (required): PR number
- `decision` (required): "approve" | "request-changes" | "reject" | "comment"
- `body` (optional): Review summary
- `ticket_id` (required): Associated ticket ID (for status update)

### `view_pr_changes`
View PR diff and changed files.
Parameters:
- `pr_number` (required): PR number
- `file_path` (optional): Specific file to view

## CTO Dashboard Integration

- Review Queue shows PRs with "needs-review" label
- CTO actions (Approve/Request Changes/Reject) call `submit_review_decision`
- Ticket status auto-updates based on review decision
- Review comments stored in ticket frontmatter (`reviewComments`, `reviewedBy`, `reviewedAt`)